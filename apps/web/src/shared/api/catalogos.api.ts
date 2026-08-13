import { apiFetch } from "./client";
import type { TipoAddenda } from "../types";

export const catalogosApi = {
  listTipos: (empresaId: string) =>
    apiFetch<{ tipos: TipoAddenda[] }>(
      `/catalogos/tipos?empresaId=${encodeURIComponent(empresaId)}`,
    ),
};
