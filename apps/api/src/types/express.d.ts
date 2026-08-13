import type { AuthUser } from "../modules/auth/auth.types.js";

// Augmenta Express.Request para exponer el usuario autenticado (lo fija authGuard).
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
