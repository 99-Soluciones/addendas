import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, it, expect } from "vitest";
import { parseCfdi, CfdiParseError } from "../cfdi.parser.js";

const here = dirname(fileURLToPath(import.meta.url));
const read = (f: string) => readFileSync(join(here, "fixtures", f), "utf8");

describe("parseCfdi", () => {
  it("extrae comprobante, IVA y conceptos con deduplicación por Descripcion", () => {
    const xml = read("cfdi-sample.xml");
    const esperado = JSON.parse(read("scenario-consolidada.json")).datosCFDI;
    expect(parseCfdi(xml)).toEqual(esperado);
  });

  it("lanza CfdiParseError si no existe el nodo Comprobante", () => {
    expect(() => parseCfdi("<root/>")).toThrow(CfdiParseError);
  });
});
