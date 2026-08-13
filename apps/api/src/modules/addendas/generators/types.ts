/**
 * Tipos del dominio de generación de addendas, espejo de las estructuras del MVP
 * (`js/getXMLData.js`, `js/generarAddenda.js`). Todos los numéricos se manejan
 * como strings ya formateados (resultado de `.toFixed(...)`), tal como el MVP,
 * para garantizar compatibilidad byte a byte del XML de salida.
 */
import type { CreateAddendaInput } from "../addendas.schema.js";

export interface CfdiComprobante {
  Serie: string;
  Folio: string;
  Fecha: string;
  /** parseFloat(SubTotal).toFixed(6) */
  SubTotal: string;
  /** Valor crudo del atributo Total (sin reformatear), como en el MVP. */
  Total: string;
  Moneda: string;
}

export interface CfdiImpuestos {
  /**
   * OJO (quirk del MVP): pese al nombre, almacena el IMPORTE del IVA (Traslado
   * con Impuesto "002"), no una tasa. El builder lo emite tal cual en <IVA>.
   */
  TasaIVA: string;
}

export interface CfdiConcepto {
  index: number;
  Descripcion: string;
  /** parseFloat(Cantidad).toFixed(2) */
  Cantidad: string;
  /** parseFloat(ValorUnitario).toFixed(6) */
  ValorUnitario: string;
  /** parseFloat(Importe).toFixed(6) */
  Importe: string;
  /** (TasaOCuota * 100).toFixed(2) del Traslado del concepto, o "0.00". */
  TasaIVA: string;
}

export interface CfdiData {
  comprobante: CfdiComprobante;
  impuestos: CfdiImpuestos;
  conceptos: CfdiConcepto[];
}

/**
 * Contrato que cada generador por empresa debe implementar.
 * El tipo intermedio entre mapear y construir es `unknown` aquí porque sólo
 * el módulo de la empresa conoce su estructura interna; el service simplemente
 * encadena las tres llamadas sin inspeccionar el valor.
 */
export interface AddendaGeneratorFunctions {
  mapear(datosCFDI: CfdiData, tipoNombre: string, input: CreateAddendaInput): unknown;
  construir(buildInput: unknown): string;
  unir(cfdiXml: string, addendaXml: string): string;
}
