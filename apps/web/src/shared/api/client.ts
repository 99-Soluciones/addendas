import { useAuthStore } from "../../stores/auth.store";
import type { AuthUser } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface SessionResponse {
  accessToken: string;
  user: AuthUser;
}

export async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include" });
    if (!res.ok) return false;
    const data = (await res.json()) as SessionResponse;
    useAuthStore.getState().setSession(data.accessToken, data.user);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });

  // Access token expirado: intenta refresh una vez y reintenta.
  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    const ok = await tryRefresh();
    if (ok) return apiFetch<T>(path, options, false);
    useAuthStore.getState().clear();
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string; details?: unknown };
    } | null;
    throw new ApiError(
      res.status,
      body?.error?.message ?? `Error ${res.status}`,
      body?.error?.details,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

/** Descarga autenticada (con refresh): devuelve el blob y el filename del header. */
export async function apiDownload(
  path: string,
  retry = true,
): Promise<{ blob: Blob; filename: string }> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_URL}${path}`, { headers, credentials: "include" });

  if (res.status === 401 && retry) {
    const ok = await tryRefresh();
    if (ok) return apiDownload(path, false);
    useAuthStore.getState().clear();
  }
  if (!res.ok) {
    throw new ApiError(res.status, `Error al descargar (${res.status})`);
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  return { blob, filename: match?.[1] ?? "addenda.xml" };
}
