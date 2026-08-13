import { apiFetch } from "./client";
import type { AuthUser } from "../types";

export interface SessionResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = {
  login: (correo: string, password: string) =>
    apiFetch<SessionResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, password }),
    }),
  register: (nombre: string, correo: string, password: string, aceptaTerminos: boolean) =>
    apiFetch<SessionResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ nombre, correo, password, aceptaTerminos }),
    }),
  me: () => apiFetch<{ user: AuthUser }>("/auth/me"),
  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
  forgotPassword: (correo: string) =>
    apiFetch<void>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ correo }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    apiFetch<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
};
