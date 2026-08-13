import { apiFetch } from "./client";
import type { Empresa } from "../types";

export const empresasApi = {
  list: () => apiFetch<{ empresas: Empresa[] }>("/empresas"),
};
