import { apiDownload, apiFetch } from "./client";
import type { AddendaListItem, CfdiPreview } from "../types";

/** Fila de datos plana: clave -> valor de texto (mismo criterio que datosGlobales). */
export type FilaDatos = Record<string, string>;

/**
 * Bolsa de secciones adicionales del formulario, agrupadas por nombre (p. ej.
 * "productos", "tarimas"). Cada cadena define sus propios grupos; el generador
 * del backend (mapearXML) es quien sabe qué grupos espera y cómo interpretarlos.
 */
export interface AddendaDatosComplementarios {
  [grupo: string]: FilaDatos[];
}

export interface CreateAddendaPayload {
  tipoAddendaId: string;
  empresaId: string;
  cfdiXml: string;
  nombreArchivo?: string;
  datosGlobales: Record<string, string>;
  datosComplementarios: AddendaDatosComplementarios;
}

export const addendasApi = {
  preview: (cfdiXml: string) =>
    apiFetch<CfdiPreview>("/addendas/preview", {
      method: "POST",
      body: JSON.stringify({ cfdiXml }),
    }),
  create: (payload: CreateAddendaPayload) =>
    apiFetch<{ id: string; xml: string }>("/addendas", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  list: () => apiFetch<{ addendas: AddendaListItem[] }>("/addendas"),
  download: (id: string) => apiDownload(`/addendas/${id}/download`),
  email: (id: string, to: string) =>
    apiFetch<{ ok: boolean }>(`/addendas/${id}/email`, {
      method: "POST",
      body: JSON.stringify({ to }),
    }),
};
