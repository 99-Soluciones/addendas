import type { AddendaDatosComplementarios } from "../../shared/api/addendas.api";
import type { CfdiPreview } from "../../shared/types";
import type { SorianaTarima } from "./forms/SorianaAddendaForm";

export interface DatosComplementariosArgs {
  preview: CfdiPreview;
  codigos: Record<number, string>;
  tarimas: SorianaTarima[];
  isConsolidada: boolean;
  tarimaPorProducto: Record<number, string>;
}

function buildPayloadSoriana({
  preview,
  codigos,
  tarimas,
  isConsolidada,
  tarimaPorProducto,
}: DatosComplementariosArgs): AddendaDatosComplementarios {
  return {
    productos: preview.conceptos
      .filter((c) => (codigos[c.index] ?? "").trim())
      .map((c) => ({
        index: String(c.index),
        codigo: (codigos[c.index] ?? "").trim(),
        ...(isConsolidada && { numeroTarima: tarimaPorProducto[c.index] || "1" }),
      })),
    tarimas: isConsolidada
      ? tarimas
          .filter((t) => t.codigoBarra.trim())
          .map((t) => ({ numero: t.numero, codigoBarra: t.codigoBarra }))
      : [],
  };
}

/**
 * Builder de `datosComplementarios` por cadena (empresa), espejo de
 * `generadoresPorCadena` en `apps/api/.../generators/registry.ts`. Cada cadena
 * nueva agrega aquí su propio builder sin tocar `NuevaAddendaPage.tsx`.
 */
const buildersPorCadena: Record<
  string,
  (args: DatosComplementariosArgs) => AddendaDatosComplementarios
> = {
  Soriana: buildPayloadSoriana,
};

export function buildDatosComplementarios(
  cadenaNombre: string,
  args: DatosComplementariosArgs,
): AddendaDatosComplementarios {
  const builder = buildersPorCadena[cadenaNombre];
  return builder ? builder(args) : {};
}
