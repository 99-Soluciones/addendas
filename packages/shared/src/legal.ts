// Metadata de los documentos legales (terminos, privacidad, cookies).
// Fuente unica compartida: el frontend la usa para mostrar/enlazar los documentos
// y el backend la usa para persistir la version aceptada al registrarse.
// El contenido (texto) de cada documento vive en el frontend (apps/web/.../legal).

export type LegalDocId = "terminos" | "privacidad" | "cookies";

export interface LegalDocMeta {
  id: LegalDocId;
  /** Titulo legible del documento. */
  titulo: string;
  /** Version del documento = fecha de ultima actualizacion (ISO). Se persiste al aceptar. */
  version: string;
  /** Fecha de ultima actualizacion en formato legible. */
  actualizado: string;
  /** Ruta publica del documento en la web. */
  ruta: string;
}

export const LEGAL_DOC_IDS = ["terminos", "privacidad", "cookies"] as const;

export const LEGAL_DOCS: Record<LegalDocId, LegalDocMeta> = {
  terminos: {
    id: "terminos",
    titulo: "Términos y Condiciones",
    version: "2026-06-26",
    actualizado: "26 de junio de 2026",
    ruta: "/legal/terminos",
  },
  privacidad: {
    id: "privacidad",
    titulo: "Aviso de Privacidad",
    version: "2026-06-26",
    actualizado: "26 de junio de 2026",
    ruta: "/legal/privacidad",
  },
  cookies: {
    id: "cookies",
    titulo: "Política de Cookies",
    version: "2026-06-26",
    actualizado: "26 de junio de 2026",
    ruta: "/legal/cookies",
  },
};
