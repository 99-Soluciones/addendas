import type { AddendaFieldConfig } from "@addendex/shared";

export type Rol = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
}

export interface Empresa {
  id: string;
  nombre: string;
  rfc: string;
}

export interface TipoAddenda {
  id: string;
  nombre: string;
  configuracionCampos: AddendaFieldConfig;
  empresa: { nombre: string };
}

export interface CfdiConcepto {
  index: number;
  Descripcion: string;
  Cantidad: string;
  ValorUnitario: string;
  Importe: string;
  TasaIVA: string;
}

export interface CfdiPreview {
  comprobante: {
    Serie: string;
    Folio: string;
    Fecha: string;
    SubTotal: string;
    Total: string;
    Moneda: string;
  };
  impuestos: { TasaIVA: string };
  conceptos: CfdiConcepto[];
}

export interface AddendaListItem {
  id: string;
  estado: "GENERADA" | "ENVIADA" | "ERROR";
  fechaGeneracion: string;
  tipoAddenda: { nombre: string };
  empresa: { nombre: string };
  informacionXml: { serieCfdi: string | null; folioCfdi: string | null } | null;
}

export interface DashboardStats {
  total: number;
  esteMes: number;
  empresa_mas_uso: string | null;
  porEstado: { estado: string; count: number }[];
  recientes: {
    id: string;
    estado: string;
    fecha: string;
    tipo: string;
    empresa: string;
    folio: string | null;
  }[];
}
