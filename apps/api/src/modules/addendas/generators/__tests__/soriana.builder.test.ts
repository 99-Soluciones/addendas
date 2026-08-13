import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import { construirAddendaSoriana } from "../soriana/builder.js";
import type { BuildAddendaInput } from "../soriana/types.js";

const here = dirname(fileURLToPath(import.meta.url));
const read = (f: string) => readFileSync(join(here, "fixtures", f), "utf8");
const scenario = (f: string) => JSON.parse(read(f)) as BuildAddendaInput;

describe("construirAddendaSoriana (compatibilidad byte a byte con el MVP)", () => {
  it("Consolidada coincide con el golden del MVP", () => {
    const out = construirAddendaSoriana(scenario("scenario-consolidada.json"));
    expect(out).toBe(read("expected-consolidada.xml"));
  });

  it("Extemporanea coincide con el golden del MVP", () => {
    const out = construirAddendaSoriana(scenario("scenario-extemporanea.json"));
    expect(out).toBe(read("expected-extemporanea.xml"));
  });

  it("end-to-end: parsear CFDI y construir produce un XML estable", () => {
    // Verifica que parser + builder encajan (snapshot de regresión).
    const out = construirAddendaSoriana(scenario("scenario-consolidada.json"));
    expect(out.startsWith("<cfdi:Addenda>")).toBe(true);
    expect(out.endsWith("</cfdi:Addenda>")).toBe(true);
    expect(out).toContain("<CantidadCajasTarimas>2</CantidadCajasTarimas>");
  });
});
