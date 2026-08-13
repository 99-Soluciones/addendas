import type { CfdiConcepto, CfdiData } from "../types.js";

/** Campos globales del formulario (espejo de recolectarDatosGlobales del MVP). */
export interface DatosGlobales {
  proveedor: string;
  tienda: string;
  entrega: string;
  cita: string;
  folioNotaEntrada: string;
  numeroBultos: string;
  folioPedido: string;
  fechaEntrega: string;
  tipoMoneda: string;
  tipoBulto: string;
}

export const TIPO_MONEDA_MAP: Record<string, string> = { MXN: "1", USD: "2", EUR: "3" };
export const TIPO_BULTO_MAP: Record<string, string> = { cajas: "1", bolsas: "2" };

/** Tarima del formulario (espejo de recolectarDatosTarimas). */
export interface TarimaInput {
  numero: string;
  codigoBarra: string;
}

/** Producto del CFDI enriquecido con código y tarima (recolectarDatosProductos). */
export interface ProductoConCodigo extends CfdiConcepto {
  Codigo: string;
  NumeroTarima: string;
}

export interface BuildAddendaInput {
  datosCFDI: CfdiData;
  datosGlobales: DatosGlobales;
  tarimas: TarimaInput[];
  productos: ProductoConCodigo[];
  isConsolidada: boolean;
}
