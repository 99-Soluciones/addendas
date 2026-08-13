import { create } from "zustand";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// El tema inicial ya lo fijo el script inline de index.html (lee localStorage o
// la preferencia del sistema). Aqui solo lo leemos del atributo ya aplicado.
function getInitialTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return current === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage puede no estar disponible (modo privado); el tema sigue activo en la sesion.
  }
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggle: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
}));
