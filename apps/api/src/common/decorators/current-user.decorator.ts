import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { UnauthorizedError } from "../../utils/http-errors.js";
import type { AuthUser } from "../../modules/auth/auth.types.js";

/**
 * Inyecta el usuario autenticado (lo fija JwtAuthGuard). Reemplaza a requireUser:
 * las rutas que lo usan van protegidas por JwtAuthGuard, asi que el throw es solo
 * una red de seguridad.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<Request>();
    if (!req.user) {
      throw new UnauthorizedError();
    }
    return req.user;
  },
);
