import type { AddendaGeneratorFunctions } from "./types.js";
import { sorianaGenerator } from "./soriana/registry.js";

const generadoresPorCadena: Record<string, AddendaGeneratorFunctions> = {
  Soriana: sorianaGenerator,
};

export function getGenerador(cadenaNombre: string): AddendaGeneratorFunctions {
  const generador = generadoresPorCadena[cadenaNombre];
  if (!generador) {
    throw new Error(`No hay generador de addenda para la cadena "${cadenaNombre}"`);
  }
  return generador;
}
