import { apiFetch } from "./client";
import type { AuthUser, Rol } from "../types";

export interface AdminUser {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  createdAt: string;
  _count: { addendas: number };
}

export const usersApi = {
  updateProfile: (data: { nombre?: string; correo?: string }) =>
    apiFetch<{ user: AuthUser }>("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<void>("/users/me/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  list: () => apiFetch<{ users: AdminUser[] }>("/users"),
};
