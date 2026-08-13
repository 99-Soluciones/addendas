import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { ForbiddenError, UnauthorizedError } from "../../utils/http-errors.js";
import type { Rol } from "../../modules/auth/auth.types.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";

/** Exige que req.user tenga uno de los roles de @Roles. Usar tras JwtAuthGuard. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles || roles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.rol)) {
      throw new ForbiddenError();
    }
    return true;
  }
}
