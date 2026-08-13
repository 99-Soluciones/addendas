import { XMLParser } from "fast-xml-parser";
import type { CfdiComprobante, CfdiConcepto, CfdiData, CfdiImpuestos } from "./types.js";

export class CfdiParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CfdiParseError";
  }
}

// removeNSPrefix: equivale al matching por local-name de querySelector en el MVP
// (cfdi:Comprobante -> Comprobante). parseAttributeValue:false: atributos como
// string, igual que getAttribute; el parseo numérico lo hacemos nosotros.
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
  parseAttributeValue: false,
  trimValues: true,
});

type XmlNode = Record<string, unknown>;

/** Normaliza un hijo XML (objeto | array | ausente) a array. */
function toArray(value: unknown): XmlNode[] {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]) as XmlNode[];
}

/** Equivale a querySelector("Traslado"): el primer Traslado descendiente. */
function firstTraslado(node: XmlNode | undefined): XmlNode | undefined {
  const traslados = (node?.["Impuestos"] as XmlNode | undefined)?.["Traslados"] as
    XmlNode | undefined;
  const traslado = traslados?.["Traslado"];
  return toArray(traslado)[0];
}

function attr(node: XmlNode, name: string): string | undefined {
  const value = node[name];
  return value === undefined || value === null ? undefined : String(value);
}

/** parseFloat(value).toFixed(n) replicando exactamente el comportamiento del MVP. */
function fixed(value: string | undefined, digits: number): string {
  return parseFloat(value as string).toFixed(digits);
}

/**
 * Parsea un CFDI 4.0 y extrae comprobante, IVA y conceptos.
 * Port fiel de procesarXML (js/getXMLData.js), incluida la deduplicación de
 * conceptos por Descripcion (sumando Cantidad e Importe).
 */
export function parseCfdi(xml: string): CfdiData {
  let doc: XmlNode;
  try {
    doc = parser.parse(xml) as XmlNode;
  } catch {
    throw new CfdiParseError("El archivo XML no tiene un formato válido");
  }

  const comprobanteNode = doc["Comprobante"] as XmlNode | undefined;
  if (!comprobanteNode) {
    throw new CfdiParseError(
      "Este no parece ser un archivo CFDI 4.0 válido. No se encontró el nodo 'cfdi:Comprobante'.",
    );
  }

  const comprobante: CfdiComprobante = {
    Serie: attr(comprobanteNode, "Serie") ?? "",
    Folio: attr(comprobanteNode, "Folio") ?? "",
    Fecha: attr(comprobanteNode, "Fecha") ?? "",
    SubTotal: fixed(attr(comprobanteNode, "SubTotal"), 6),
    Total: attr(comprobanteNode, "Total") ?? "",
    Moneda: attr(comprobanteNode, "Moneda") ?? "",
  };

  // IVA: Traslado a nivel comprobante con Impuesto === "002".
  const impuestos: CfdiImpuestos = { TasaIVA: "0.00" };
  const trasladosComprobante = toArray(
    ((comprobanteNode["Impuestos"] as XmlNode | undefined)?.["Traslados"] as XmlNode | undefined)?.[
      "Traslado"
    ],
  );
  for (const t of trasladosComprobante) {
    if (attr(t, "Impuesto") === "002") {
      const importe = attr(t, "Importe");
      impuestos.TasaIVA = importe ? parseFloat(importe).toFixed(2) : "0.00";
      break;
    }
  }

  // Conceptos con deduplicación por Descripcion.
  const conceptoNodes = toArray(
    (comprobanteNode["Conceptos"] as XmlNode | undefined)?.["Concepto"],
  );
  const conceptos: CfdiConcepto[] = [];
  let index = 0;

  for (const nodo of conceptoNodes) {
    const descripcion = attr(nodo, "Descripcion") ?? "";
    const existente = conceptos.find((c) => c.Descripcion === descripcion);

    if (existente) {
      existente.Cantidad = (
        parseFloat(existente.Cantidad) + parseFloat(attr(nodo, "Cantidad") as string)
      ).toFixed(2);
      existente.Importe = (
        parseFloat(existente.Importe) + parseFloat(attr(nodo, "Importe") as string)
      ).toFixed(6);
    } else {
      const trasladoNode = firstTraslado(nodo);
      conceptos.push({
        index,
        Descripcion: descripcion,
        Cantidad: fixed(attr(nodo, "Cantidad"), 2),
        ValorUnitario: fixed(attr(nodo, "ValorUnitario"), 6),
        Importe: fixed(attr(nodo, "Importe"), 6),
        TasaIVA: trasladoNode
          ? (parseFloat(attr(trasladoNode, "TasaOCuota") as string) * 100).toFixed(2)
          : "0.00",
      });
      index++;
    }
  }

  return { comprobante, impuestos, conceptos };
}
