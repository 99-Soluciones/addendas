import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../stores/theme.store";

interface ThemeToggleProps {
  className?: string;
}

/** Boton para alternar entre tema claro y oscuro. */
export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Tema claro" : "Tema oscuro"}
      className={`flex size-8 items-center justify-center rounded text-ink transition-colors hover:bg-elevated hover:text-ink ${className}`}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
