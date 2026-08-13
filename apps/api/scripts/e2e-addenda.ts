import { readFileSync } from "node:fs";

const BASE = "http://127.0.0.1:3000/api/v1";
const file = process.argv[2];
if (!file) {
  console.error("Uso: tsx scripts/e2e-addenda.ts <ruta-cfdi.xml>");
  process.exit(1);
}
const raw = readFileSync(file, "utf8");

async function login(): Promise<string> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: "user@addenda.local", password: "User123!" }),
  });
  const data = (await res.json()) as { accessToken: string };
  console.log("login:", res.status);
  return data.accessToken;
}

const token = await login();
const auth = { Authorization: `Bearer ${token}` };

const empresas = (await (await fetch(`${BASE}/empresas`, { headers: auth })).json()) as {
  empresas: { id: string; nombre: string }[];
};
console.log("empresas:", empresas.empresas.map((e) => e.nombre).join(", "));
const empresaId = empresas.empresas[0]!.id;

const tipos = (await (await fetch(`${BASE}/catalogos/tipos`, { headers: auth })).json()) as {
  tipos: { id: string; nombre: string }[];
};
console.log("tipos:", tipos.tipos.map((t) => t.nombre).join(", "));
const tipo = tipos.tipos.find((t) => t.nombre === "Consolidada")!;

const codigos = [
  "7500462969639",
  "7500462969615",
  "7500462969622",
  "7500462969646",
  "7500462969608",
];
const body = {
  tipoAddendaId: tipo.id,
  empresaId,
  cfdiXml: raw,
  datosGlobales: {
    proveedor: "25799",
    tienda: "5548",
    entrega: "5548",
    cita: "1000645242",
    folioPedido: "141047013",
    fechaEntrega: "2026-06-06",
    numeroBultos: "37",
  },
  datosComplementarios: {
    productos: codigos.map((codigo, index) => ({
      index: String(index),
      codigo,
      numeroTarima: "1",
    })),
    tarimas: [{ numero: "1", codigoBarra: "750046296229620294" }],
  },
};

const createRes = await fetch(`${BASE}/addendas`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const created = (await createRes.json()) as { id: string; xml: string };
console.log("POST /addendas:", createRes.status, "id:", created.id);

const s = raw.indexOf("<cfdi:Addenda");
const e = raw.indexOf("</cfdi:Addenda>");
const real = raw.substring(s, e + "</cfdi:Addenda>".length);
const norm = (t: string) =>
  t
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
console.log("generada == real (normalizada):", norm(created.xml) === norm(real));

const list = (await (await fetch(`${BASE}/addendas`, { headers: auth })).json()) as {
  addendas: unknown[];
};
console.log("GET /addendas count:", list.addendas.length);

const stats = await (await fetch(`${BASE}/dashboard/stats`, { headers: auth })).json();
console.log("GET /dashboard/stats:", JSON.stringify(stats));

const dl = await fetch(`${BASE}/addendas/${created.id}/download`, { headers: auth });
console.log(
  "GET download:",
  dl.status,
  dl.headers.get("content-type"),
  "len:",
  (await dl.text()).length,
);

const emailRes = await fetch(`${BASE}/addendas/${created.id}/email`, {
  method: "POST",
  headers: { ...auth, "Content-Type": "application/json" },
  body: JSON.stringify({ to: "cliente@example.com" }),
});
console.log("POST email (sin SMTP -> 400 esperado):", emailRes.status);
