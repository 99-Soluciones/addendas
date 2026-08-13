export type Rol = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  rol: Rol;
}

export interface AccessTokenPayload {
  sub: string;
  rol: Rol;
}

export interface PublicUser {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
}
