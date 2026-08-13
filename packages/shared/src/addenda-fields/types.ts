/**
 * Descriptor de campos dinámicos de una addenda.
 *
 * Vive en `tipos_addenda.configuracion_campos` (JSONB) en la base de datos y se
 * usa tanto en el frontend (para renderizar el formulario con React Hook Form)
 * como en el backend (para validar con Zod). Es la fuente única del contrato del
 * formulario, derivada del MVP estático `Addenda-Soriana`.
 */

export type FieldType = "text" | "number" | "date" | "select";

/** Ámbito del campo dentro del formulario de addenda. */
export type FieldScope = "global" | "producto" | "tarima";

export interface FieldDescriptor {
  /** Identificador del campo (clave en el objeto de datos del formulario). */
  name: string;
  /** Etiqueta visible para el usuario. */
  label: string;
  type: FieldType;
  scope: FieldScope;
  required: boolean;
  placeholder?: string;
  /** Mínimo para campos numéricos. */
  min?: number;
  /** Opciones para campos select. */
  options?: { label: string; value: string | number }[];
  /**
   * Si está presente, el valor por defecto se autocalcula en el frontend.
   * `sumCantidades` = suma de las cantidades de todos los conceptos del CFDI.
   */
  autocompute?: "sumCantidades";
}

export interface AddendaFieldConfig {
  /** Versión del esquema de configuración (para migraciones futuras del JSONB). */
  version: number;
  fields: FieldDescriptor[];
}
