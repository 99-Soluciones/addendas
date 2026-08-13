import { SetMetadata } from "@nestjs/common";
import type { Rol } from "../../modules/auth/auth.types.js";

export const ROLES_KEY = "roles";

/** Marca los roles permitidos en un handler/controlador. Se aplica con RolesGuard. */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
