import { readFileSync } from "node:fs";
import { parseCfdi } from "../src/modules/addendas/generators/cfdi.parser.js";
import { construirAddendaSoriana } from "../src/modules/addendas/generators/soriana.builder.js";
import type { ProductoConCodigo } from "../src/modules/addendas/generators/types.js";

const file = process.argv[2];
if (!file) {
  console.error("Uso: tsx scripts/verify-real.ts <ruta-cfdi.xml>");
  process.exit(1);
}
const raw = readFileSync(file, "utf8");
const data = parseCfdi(raw);

console.log("=== PARSED ===");
console.log("comprobante:", JSON.stringify(data.comprobante));
console.log("impuestos:", JSON.stringify(data.impuestos));
console.log("conceptos:", data.conceptos.length);
data.conceptos.forEach((c) =>
  console.log(
    `  [${c.index}] cant=${c.Cantidad} vu=${c.ValorUnitario} imp=${c.Importe} iva=${c.TasaIVA} :: ${c.Descripcion.slice(0, 45)}`,
  ),
);

// Códigos tomados del addenda real (Articulos0..4, en orden).
const codigos = [
  "7500462969639",
  "7500462969615",
  "7500462969622",
  "7500462969646",
  "7500462969608",
];
const productos: ProductoConCodigo[] = data.conceptos.map((c, i) => ({
  ...c,
  Codigo: codigos[i] ?? "",
  NumeroTarima: "1",
}));

const out = construirAddendaSoriana({
  datosCFDI: data,
  datosGlobales: {
    proveedor: "25799",
    tienda: "5548",
    entrega: "5548",
    cita: "1000645242",
    folioNotaEntrada: "",
    numeroBultos: "37",
    folioPedido: "141047013",
    fechaEntrega: "2026-06-06",
  },
  tarimas: [{ numero: "1", codigoBarra: "750046296229620294" }],
  productos,
  isConsolidada: true,
});

const s = raw.indexOf("<cfdi:Addenda");
const e = raw.indexOf("</cfdi:Addenda>");
const real = raw.substring(s, e + "</cfdi:Addenda>".length);

const norm = (t: string) =>
  t
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n");

console.log("\n=== COMPARISON ===");
console.log("exact match:", out === real);
console.log("whitespace-normalized match:", norm(out) === norm(real));

const a = norm(out).split("\n");
const b = norm(real).split("\n");
console.log("mine lines:", a.length, "| real lines:", b.length);
for (let i = 0; i < Math.max(a.length, b.length); i++) {
  if (a[i] !== b[i]) {
    console.log(`primera diferencia (normalizada) en línea ${i}:`);
    console.log("  mine:", JSON.stringify(a[i]));
    console.log("  real:", JSON.stringify(b[i]));
    break;
  }
}
