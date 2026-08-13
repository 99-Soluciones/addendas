import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { verifyAccessToken } from "../../modules/auth/tokens.js";
import { AppError, UnauthorizedError } from "../../utils/http-errors.js";

/** Exige un access token Bearer valido y fija req.user. Equivalente a authGuard. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token de acceso faltante");
    }

    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = await verifyAccessToken(token);
      req.user = { id: payload.sub, rol: payload.rol };
      return true;
    } catch (error: unknown) {
      throw error instanceof AppError ? error : new UnauthorizedError("Token inválido o expirado");
    }
  }
}
