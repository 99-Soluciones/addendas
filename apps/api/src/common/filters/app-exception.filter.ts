import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from "@nestjs/common";
import type { Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../lib/logger.js";
import { AppError } from "../../utils/http-errors.js";

// Codigo de error por status para las HttpException que genera el propio Nest
const CODE_BY_STATUS: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
};

/**
 * Filtro global de errores.
 * Respuesta `{ error: { code, message, details } }` y mismos status. NestJS
 * tambien reenvia aqui los rechazos de promesas de los handlers.
 */
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ZodError) {
      res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Datos de entrada inválidos",
          details: exception.issues,
        },
      });
      return;
    }

    if (exception instanceof AppError) {
      res.status(exception.statusCode).json({
        error: { code: exception.code, message: exception.message, details: exception.details },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === "string"
          ? body
          : (((body as { message?: unknown }).message as string | undefined) ?? exception.message);
      res.status(status).json({ error: { code: CODE_BY_STATUS[status] ?? "ERROR", message } });
      return;
    }

    logger.error({ err: exception }, "Error no controlado");
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" },
    });
  }
}
