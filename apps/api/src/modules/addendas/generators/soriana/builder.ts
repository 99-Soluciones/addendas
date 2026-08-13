import { BadRequestError } from "../../../../utils/http-errors.js";
import type { CreateAddendaInput } from "../../addendas.schema.js";
import type { CfdiData } from "../types.js";
import {
  TIPO_BULTO_MAP,
  TIPO_MONEDA_MAP,
  type BuildAddendaInput,
  type DatosGlobales,
  type ProductoConCodigo,
  type TarimaInput,
} from "./types.js";

/**
 * Port VERBATIM del builder del MVP (js/generarAddenda.js): construirAddenda +
 * las tres secciones. La indentación literal (4/8/12 espacios) y el separador
 * join('        ') (8 espacios) son significativos: no modificar sin actualizar
 * los golden tests, porque rompe la compatibilidad byte a byte con el MVP.
 *
 * NOTA (quirk pendiente de decisión): el MVP NO escapa los valores en el XML.
 * Se preserva ese comportamiento para compatibilidad; si una descripción o un
 * dato contiene & < > se produciría XML inválido. Ver M3 en el plan.
 */
/** Un tipo "Consolidada" usa tarimas; cualquier otro (p. ej. "Extemporanea") no. */

function toDatosGlobales(raw: Record<string, string>): DatosGlobales {
  return {
    proveedor: raw.proveedor ?? "",
    tienda: raw.tienda ?? "",
    entrega: raw.entrega ?? "",
    cita: raw.cita ?? "",
    folioNotaEntrada: raw.folioNotaEntrada ?? "",
    numeroBultos: raw.numeroBultos ?? "",
    folioPedido: raw.folioPedido ?? "",
    fechaEntrega: raw.fechaEntrega ?? "",
    tipoMoneda: raw.tipoMoneda ?? "MXN",
    tipoBulto: raw.tipoBulto ?? "cajas",
  };
}

export function esConsolidada(tipoNombre: string): boolean {
  return tipoNombre === "Consolidada";
}

/**
 * Paso de mapeo: convierte el input genérico del API en el BuildAddendaInput
 * tipado de Soriana, listo para pasar a construirAddendaSoriana.
 */
export function mapearXML(
  datosCFDI: CfdiData,
  tipoNombre: string,
  input: CreateAddendaInput,
): BuildAddendaInput {
  const consolidada = esConsolidada(tipoNombre);

  const productosRaw = input.datosComplementarios.productos ?? [];
  const productos: ProductoConCodigo[] = [];
  for (const p of productosRaw) {
    const index = Number(p.index);
    const concepto = Number.isInteger(index) ? datosCFDI.conceptos[index] : undefined;
    if (!concepto) continue;
    productos.push({
      ...concepto,
      Codigo: p.codigo ?? "",
      NumeroTarima: p.numeroTarima ?? "",
    });
  }
  if (productos.length === 0) {
    throw new BadRequestError("Ningún producto coincide con los conceptos del CFDI");
  }

  const datosGlobales = toDatosGlobales(input.datosGlobales);
  const tarimasRaw = input.datosComplementarios.tarimas ?? [];
  const tarimas: TarimaInput[] = consolidada
    ? tarimasRaw.map((t) => ({ numero: t.numero ?? "", codigoBarra: t.codigoBarra ?? "" }))
    : [];

  return { datosCFDI, datosGlobales, tarimas, productos, isConsolidada: consolidada };
}

function construirSeccionArticulos(
  productos: ProductoConCodigo[],
  datosGlobales: DatosGlobales,
  remision: string,
): string {
  return productos
    .map(
      (p, index) => `
        <Articulos Id="Articulos${index}" RowOrder="${index}">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${datosGlobales.folioPedido}</FolioPedido>
            <Tienda>${datosGlobales.tienda}</Tienda>
            <Codigo>${p.Codigo}</Codigo>
            <CantidadUnidadCompra>${p.Cantidad}</CantidadUnidadCompra>
            <CostoNetoUnidadCompra>${p.ValorUnitario}</CostoNetoUnidadCompra>
            <PorcentajeIEPS>0.00</PorcentajeIEPS>
            <PorcentajeIVA>${p.TasaIVA}</PorcentajeIVA>
        </Articulos>`,
    )
    .join("");
}

function construirSeccionCajasTarimas(
  tarimas: TarimaInput[],
  datosGlobales: DatosGlobales,
  remision: string,
  cantidadArticulos: number,
): string {
  return tarimas
    .map(
      (tarima, index) => `
        <CajasTarimas Id="CajaTarima${index}" RowOrder="${index}">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <NumeroCajaTarima>${tarima.numero}</NumeroCajaTarima>
            <CodigoBarraCajaTarima>${tarima.codigoBarra}</CodigoBarraCajaTarima>
            <SucursalDistribuir>${datosGlobales.entrega}</SucursalDistribuir>
            <CantidadArticulos>${cantidadArticulos}</CantidadArticulos>
        </CajasTarimas>`,
    )
    .join("");
}

function construirSeccionArticulosPorTarima(
  productos: ProductoConCodigo[],
  datosGlobales: DatosGlobales,
  remision: string,
): string {
  return productos
    .map(
      (p, index) => `
        <ArticulosPorCajaTarima Id="ArticulosPorCajaTarima${index}" RowOrder="${index}">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${datosGlobales.folioPedido}</FolioPedido>
            <NumeroCajaTarima>${p.NumeroTarima}</NumeroCajaTarima>
            <SucursalDistribuir>${datosGlobales.entrega}</SucursalDistribuir>
            <Codigo>${p.Codigo}</Codigo>
            <CantidadUnidadCompra>${p.Cantidad}</CantidadUnidadCompra>
        </ArticulosPorCajaTarima>`,
    )
    .join("");
}

export function construirAddendaSoriana(input: BuildAddendaInput): string {
  const { datosCFDI, datosGlobales, tarimas, productos, isConsolidada } = input;

  const remision = `${datosCFDI.comprobante.Serie || ""}-${datosCFDI.comprobante.Folio}`;
  const fechaRemision = datosCFDI.comprobante.Fecha.substring(0, 10);
  const totalArticulos = datosCFDI.conceptos.length;
  const totalTarimas = tarimas.length;

  const subtotal = datosCFDI.comprobante.SubTotal;
  const iva = datosCFDI.impuestos.TasaIVA;
  const total = datosCFDI.comprobante.Total;
  const cantidadTotalBultos = parseFloat(datosGlobales.numeroBultos);

  const articulosXML = construirSeccionArticulos(productos, datosGlobales, remision);
  const cajasTarimasXML = isConsolidada
    ? construirSeccionCajasTarimas(tarimas, datosGlobales, remision, datosCFDI.conceptos.length)
    : "";
  const articulosPorTarimaXML = isConsolidada
    ? construirSeccionArticulosPorTarima(productos, datosGlobales, remision)
    : "";

  const seccionesXML = [articulosXML, cajasTarimasXML, articulosPorTarimaXML]
    .filter((seccion) => seccion.trim())
    .join("        ");

  const addenda = `<cfdi:Addenda>
    <DSCargaRemisionProv>
        <Remision Id="Remision0" RowOrder="0">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <Consecutivo>0</Consecutivo>
            <FechaRemision>${fechaRemision}</FechaRemision>
            <Tienda>${datosGlobales.tienda}</Tienda>
            <TipoMoneda>${TIPO_MONEDA_MAP[datosGlobales.tipoMoneda] ?? "1"}</TipoMoneda>
            <TipoBulto>${TIPO_BULTO_MAP[datosGlobales.tipoBulto] ?? "1"}</TipoBulto>
            <EntregaMercancia>${datosGlobales.entrega}</EntregaMercancia>
            <CumpleReqFiscales>true</CumpleReqFiscales>
            <CantidadBultos>${cantidadTotalBultos}</CantidadBultos>
            <Subtotal>${subtotal}</Subtotal>
            <Descuentos>0.00</Descuentos>
            <IEPS>0.00</IEPS>
            <IVA>${iva}</IVA>
            <OtrosImpuestos>0.00</OtrosImpuestos>
            <Total>${total}</Total>
            <CantidadPedidos>1</CantidadPedidos>
            <FechaEntregaMercancia>${datosGlobales.fechaEntrega}</FechaEntregaMercancia>
            ${
              isConsolidada
                ? `<EmpaqueEnCajas>true</EmpaqueEnCajas>
            <EmpaqueEnTarimas>true</EmpaqueEnTarimas>
            <CantidadCajasTarimas>${totalTarimas}</CantidadCajasTarimas>
            <Cita>${datosGlobales.cita}</Cita>`
                : `<FolioNotaEntrada>${datosGlobales.folioNotaEntrada}</FolioNotaEntrada>`
            }
        </Remision>
        <Pedidos Id="Pedidos0" RowOrder="0">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${datosGlobales.folioPedido}</FolioPedido>
            <Tienda>${datosGlobales.tienda}</Tienda>
            <CantidadArticulos>${totalArticulos}</CantidadArticulos>
        </Pedidos>${seccionesXML}
    </DSCargaRemisionProv>
</cfdi:Addenda>`;

  return addenda.trim();
}

export function unirAddendaSoriana(cfdiXml: string, addendaXml: string): string {
  const marker = "</cfdi:Complemento>";
  const idx = cfdiXml.lastIndexOf(marker);
  if (idx !== -1) {
    const insertAt = idx + marker.length;
    return cfdiXml.slice(0, insertAt) + "\n" + addendaXml + cfdiXml.slice(insertAt);
  }
  const fallback = "</cfdi:Comprobante>";
  const fi = cfdiXml.lastIndexOf(fallback);
  if (fi !== -1) {
    return cfdiXml.slice(0, fi) + addendaXml + "\n" + cfdiXml.slice(fi);
  }
  return cfdiXml + "\n" + addendaXml;
}
