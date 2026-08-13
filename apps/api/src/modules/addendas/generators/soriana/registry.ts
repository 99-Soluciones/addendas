import type { AddendaGeneratorFunctions } from "../types.js";
import type { BuildAddendaInput } from "./types.js";
import { mapearXML, construirAddendaSoriana, unirAddendaSoriana } from "./builder.js";

export const sorianaGenerator: AddendaGeneratorFunctions = {
  mapear: mapearXML,
  construir: (data) => construirAddendaSoriana(data as BuildAddendaInput),
  unir: unirAddendaSoriana,
};
