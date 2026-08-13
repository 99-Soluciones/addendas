import { create } from "zustand";
import type { AuthUser } from "../shared/types";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (accessToken: string, user: AuthUser) => void;
  clear: () => void;
}

// El access token vive solo en memoria; la sesión se rehidrata al cargar la app
// llamando a /auth/refresh (cookie httpOnly).
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  clear: () => set({ accessToken: null, user: null }),
}));
