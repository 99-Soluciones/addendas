import type { AddendaFieldConfig, FieldDescriptor } from "./types.js";

/**
 * Configuraciones de campos de las addendas de Soriana, derivadas 1:1 del MVP
 * `Addenda-Soriana` (index.html / formData.js / validacion.js).
 *
 * Orden de los campos globales según el formulario original:
 * proveedor, tienda, entrega, [cita | folioNotaEntrada], folioPedido,
 * fechaEntrega, numeroBultos.
 */

const globalesIniciales: FieldDescriptor[] = [
  {
    name: "proveedor",
    label: "Número de Proveedor",
    type: "text",
    scope: "global",
    required: true,
  },
  { name: "tienda", label: "Número de Tienda", type: "text", scope: "global", required: true },
  {
    name: "entrega",
    label: "Lugar de Entrega (Tienda)",
    type: "text",
    scope: "global",
    required: true,
  },
  {
    name: "tipoMoneda",
    label: "Tipo de moneda",
    type: "select",
    scope: "global",
    required: true,
    options: [
      { label: "MXN", value: "MXN" },
      { label: "USD", value: "USD" },
      { label: "EUR", value: "EUR" },
    ],
  },
  {
    name: "tipoBulto",
    label: "Tipo de bulto",
    type: "select",
    scope: "global",
    required: true,
    options: [
      { label: "Cajas", value: "cajas" },
      { label: "Bolsas", value: "bolsas" },
    ],
  },
];

const globalesFinales: FieldDescriptor[] = [
  { name: "folioPedido", label: "Folio Pedido", type: "text", scope: "global", required: true },
  {
    name: "fechaEntrega",
    label: "Fecha Entrega Mercancía",
    type: "date",
    scope: "global",
    required: true,
  },
  {
    name: "numeroBultos",
    label: "Número de Bultos",
    type: "number",
    scope: "global",
    required: true,
    min: 1,
    autocompute: "sumCantidades",
  },
];

const codigoProducto: FieldDescriptor = {
  name: "codigo",
  label: "Código (SKU/EAN)",
  type: "text",
  scope: "producto",
  required: true,
  placeholder: "Ingrese el código del producto",
};

export const SORIANA_CONSOLIDADA: AddendaFieldConfig = {
  version: 1,
  fields: [
    ...globalesIniciales,
    { name: "cita", label: "Número de Cita", type: "text", scope: "global", required: true },
    ...globalesFinales,
    codigoProducto,
    {
      name: "numeroTarima",
      label: "N° Tarima",
      type: "number",
      scope: "producto",
      required: true,
      min: 1,
    },
    {
      name: "codigoBarra",
      label: "Código de Barras (SSCC)",
      type: "text",
      scope: "tarima",
      required: true,
      placeholder: "Código SSCC de la tarima",
    },
  ],
};

export const SORIANA_EXTEMPORANEA: AddendaFieldConfig = {
  version: 1,
  fields: [
    ...globalesIniciales,
    {
      name: "folioNotaEntrada",
      label: "Folio Nota de Entrada",
      type: "text",
      scope: "global",
      required: true,
    },
    ...globalesFinales,
    codigoProducto,
  ],
};
