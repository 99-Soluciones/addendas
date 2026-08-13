import { z } from "zod";
import type { AddendaFieldConfig, FieldDescriptor, FieldScope } from "./types.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Construye el esquema Zod de un campo individual según su descriptor. */
function fieldSchema(field: FieldDescriptor): z.ZodTypeAny {
  switch (field.type) {
    case "number": {
      let schema = z.coerce.number();
      if (field.min !== undefined) {
        schema = schema.min(field.min, `${field.label} debe ser mayor o igual a ${field.min}`);
      }
      return field.required ? schema : schema.optional();
    }
    case "date": {
      const schema = z.string().regex(DATE_RE, `${field.label} debe tener formato AAAA-MM-DD`);
      return field.required ? schema : z.union([schema, z.literal("")]);
    }
    case "text":
    default: {
      if (field.required) {
        return z.string().trim().min(1, `${field.label} es requerido`);
      }
      return z.string().trim().optional();
    }
    case "select": {
      if (field.required) {
        return z.string().trim().min(1, `${field.label} es requerido`);
      }
      return z.string().trim().optional();
    }
  }
}

/** Filtra los campos de una configuración por ámbito, conservando el orden. */
export function fieldsByScope(config: AddendaFieldConfig, scope: FieldScope): FieldDescriptor[] {
  return config.fields.filter((field) => field.scope === scope);
}

/**
 * Construye dinámicamente un esquema Zod para un ámbito (global/producto/tarima)
 * a partir de la configuración de campos de un tipo de addenda.
 */
export function buildZodSchema(config: AddendaFieldConfig, scope: FieldScope) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fieldsByScope(config, scope)) {
    shape[field.name] = fieldSchema(field);
  }
  return z.object(shape);
}
