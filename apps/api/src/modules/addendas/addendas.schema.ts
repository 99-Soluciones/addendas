import { z } from "zod";

const filaDatosSchema = z.record(z.string(), z.string());

export const createAddendaSchema = z.object({
  tipoAddendaId: z.guid("tipoAddendaId inválido"),
  empresaId: z.guid("empresaId inválido"),
  cfdiXml: z.string().min(1, "El XML del CFDI es requerido"),
  nombreArchivo: z.string().optional(),
  datosGlobales: filaDatosSchema,
  /**
   * Bolsa de secciones adicionales agrupadas por nombre (p. ej. "productos",
   * "tarimas"). Cada generador (`generators/<cadena>/`) sabe qué grupos espera
   * y cómo interpretar sus filas; el schema genérico no necesita conocerlos.
   */
  datosComplementarios: z.record(z.string(), z.array(filaDatosSchema)).default({}),
});
export type CreateAddendaInput = z.infer<typeof createAddendaSchema>;

export const emailAddendaSchema = z.object({
  to: z.email("Correo inválido"),
});

export const previewSchema = z.object({
  cfdiXml: z.string().min(1, "El XML del CFDI es requerido"),
});
