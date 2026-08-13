import { ApiBody } from "@nestjs/swagger";
import { z } from "zod";
import type { ZodType } from "zod";

/**
 * Tipo de Schema Object que esperan los decoradores de @nestjs/swagger. Lo
 * derivamos de la firma publica de `ApiBody` (sin importar rutas internas: su
 * `exports` no las expone y bajo NodeNext romperia). Sus opciones son una union
 * (ApiBodyMetadata | ApiBodySchemaHost); extraemos el `schema` del miembro que lo
 * declara como requerido.
 */
type SchemaHost<T> = T extends { schema: infer S } ? S : never;
type OpenApiSchema = NonNullable<SchemaHost<NonNullable<Parameters<typeof ApiBody>[0]>>>;

/**
 * Convierte un esquema Zod en un Schema Object de OpenAPI 3.0 usando el conversor
 * nativo de Zod 4 (`z.toJSONSchema`). Mantiene a Zod como unica fuente de verdad:
 * el mismo esquema valida (ZodValidationPipe) y documenta. Usa la representacion
 * de "input" para que coincida con lo que recibe el endpoint (los `.default()`
 * quedan opcionales en el cuerpo de la peticion).
 */
export function zodToOpenApi(schema: ZodType): OpenApiSchema {
  return z.toJSONSchema(schema, {
    io: "input",
    target: "openapi-3.0",
  }) as unknown as OpenApiSchema;
}

/** `@ApiBody` derivado de un esquema Zod, sin duplicar la definicion. */
export function ApiZodBody(schema: ZodType, description?: string): MethodDecorator {
  return ApiBody({ description, schema: zodToOpenApi(schema) });
}

/**
 * Forma del error que produce AppExceptionFilter:
 * `{ error: { code, message, details? } }`. Se referencia en las respuestas de
 * error para documentar el contrato real.
 */
export const ERROR_ENVELOPE: OpenApiSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "object",
      required: ["code", "message"],
      properties: {
        code: { type: "string", example: "VALIDATION_ERROR" },
        message: { type: "string" },
        details: { type: "object", additionalProperties: true },
      },
    },
  },
} as unknown as OpenApiSchema;
