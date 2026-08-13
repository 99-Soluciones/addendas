// Generador de golden fixtures. Contiene una COPIA VERBATIM de las funciones del
// builder del MVP (Addenda-Soriana/js/generarAddenda.js), independiente del port
// TypeScript. Si el port y esta copia divergen, los golden tests fallan. Ejecutar:
//   node build-golden.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// ===== INICIO copia verbatim de js/generarAddenda.js =====
function construirSeccionArticulos(productos, datosGlobales, remision) {
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

function construirSeccionCajasTarimas(tarimas, datosGlobales, remision, cantidadArticulos) {
  return tarimas
    .map((tarima, index) => {
      return `
        <CajasTarimas Id="CajaTarima${index}" RowOrder="${index}">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <NumeroCajaTarima>${tarima.numero}</NumeroCajaTarima>
            <CodigoBarraCajaTarima>${tarima.codigoBarra}</CodigoBarraCajaTarima>
            <SucursalDistribuir>${datosGlobales.entrega}</SucursalDistribuir>
            <CantidadArticulos>${cantidadArticulos}</CantidadArticulos>
        </CajasTarimas>`;
    })
    .join("");
}

function construirSeccionArticulosPorTarima(productos, datosGlobales, remision) {
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

function construirAddenda(datosCFDI, datosGlobales, tarimas, productosConCodigo, isConsolidada) {
  const remision = `${datosCFDI.comprobante.Serie || ""}-${datosCFDI.comprobante.Folio}`;
  const fechaRemision = datosCFDI.comprobante.Fecha.substring(0, 10);
  const totalArticulos = datosCFDI.conceptos.length;
  const totalTarimas = tarimas.length;

  const subtotal = datosCFDI.comprobante.SubTotal;
  const iva = datosCFDI.impuestos.TasaIVA;
  const total = datosCFDI.comprobante.Total;
  const cantidadTotalBultos = parseFloat(datosGlobales.numeroBultos);

  const articulosXML = construirSeccionArticulos(productosConCodigo, datosGlobales, remision);
  const cajasTarimasXML = isConsolidada
    ? construirSeccionCajasTarimas(tarimas, datosGlobales, remision, datosCFDI.conceptos.length)
    : "";
  const articulosPorTarimaXML = isConsolidada
    ? construirSeccionArticulosPorTarima(productosConCodigo, datosGlobales, remision)
    : "";
  const TIPO_MONEDA_MAP = { MXN: "1", USD: "2", EUR: "3" };
  const TIPO_BULTO_MAP = { cajas: "1", bolsas: "2" };

  const seccionesXML = [articulosXML, cajasTarimasXML, articulosPorTarimaXML]
    .filter((seccion) => seccion.trim())
    .join("        ");

  return `<cfdi:Addenda>
    <DSCargaRemisionProv>
        <Remision Id="Remision0" RowOrder="0">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <Consecutivo>0</Consecutivo>
            <FechaRemision>${fechaRemision}</FechaRemision>
            <Tienda>${datosGlobales.tienda}</Tienda>
            <TipoMoneda>${TIPO_MONEDA_MAP[datosGlobales.tipoMoneda]}</TipoMoneda>
            <TipoBulto>${TIPO_BULTO_MAP[datosGlobales.tipoBulto]}</TipoBulto>
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
}
// ===== FIN copia verbatim =====

function generar(scenarioFile, outFile) {
  const s = JSON.parse(readFileSync(join(here, scenarioFile), "utf8"));
  const salida = construirAddenda(
    s.datosCFDI,
    s.datosGlobales,
    s.tarimas,
    s.productos,
    s.isConsolidada,
  ).trim();
  writeFileSync(join(here, outFile), salida, "utf8");
  console.log(`Escrito ${outFile} (${salida.length} bytes)`);
}

generar("scenario-consolidada.json", "expected-consolidada.xml");
generar("scenario-extemporanea.json", "expected-extemporanea.xml");
