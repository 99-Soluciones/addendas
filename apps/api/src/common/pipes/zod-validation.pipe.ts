import { Injectable, type PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

/**
 * Valida y normaliza un valor con un esquema Zod. Reemplaza el middleware
 * `validateBody`: ante un fallo lanza el ZodError tal cual y el AppExceptionFilter
 * lo formatea como 400, igual que el errorHandler de Express. Devuelve el dato ya
 * parseado (con los transforms de Zod aplicados).
 *
 * Uso: `@Body(new ZodValidationPipe(miSchema)) dto: MiTipo`.
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw result.error;
    }
    return result.data;
  }
}
