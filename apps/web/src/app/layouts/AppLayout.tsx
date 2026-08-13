import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { authApi } from "../../shared/api/auth.api";
import { ThemeToggle } from "../../shared/components/ThemeToggle";
import { Toaster } from "../../shared/components/ui/Toaster";
import { Button } from "../../shared/components/ui/Button";

interface NavEntry {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const navItems: NavEntry[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/addendas", label: "Addendas", icon: FileText },
  { to: "/cuenta", label: "Cuenta", icon: UserCog },
  { to: "/ayuda", label: "Ayuda", icon: HelpCircle },
];

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  onNavigate,
}: NavEntry & { onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
          isActive ? "bg-elevated text-accent" : "text-muted hover:bg-elevated hover:text-ink"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`size-4 transition-all ${isActive ? "text-accent" : ""}`}
            fill={isActive ? "currentColor" : "none"}
            fillOpacity={isActive ? 0.15 : undefined}
          />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await authApi.logout().catch(() => undefined);
    clear();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <header className="flex items-center justify-between gap-2 border-b border-line bg-surface px-3 py-3 sm:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
            className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-ink md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="99 Soluciones" className="h-12 w-auto" />
            <span className="text-sm font-normal tracking-tight text-ink">
              Generador de addendas
            </span>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <span className="hidden max-w-40 truncate text-sm text-ink sm:inline">
            {user?.nombre}
          </span>
          <Button
            type="button"
            onClick={handleLogout}
            aria-label="Salir"
            title="Salir"
            variant="ghost"
            className="flex items-center gap-1 text-sm text-ink"
          >
            <LogOut className="size-4 text-ink" />
            <span className="hidden sm:inline text-ink">Salir</span>
          </Button>
        </div>
      </header>

      <div className="relative flex flex-1">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            aria-hidden="true"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-30 w-56 shrink-0 border-r border-line bg-surface p-3 transition-transform duration-200 ease-in-out md:static md:z-auto md:w-56 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-lg font-semibold text-ink pl-3 md:hidden">Menú</span>

            <div className="mb-2 flex items-center justify-end md:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Cerrar menú"
                className="grid size-8 place-items-center rounded-md text-muted transition-colors hover:bg-elevated hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <nav className="flex w-full flex-col gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                end={item.end}
                onNavigate={() => setSidebarOpen(false)}
              />
            ))}
            {user?.rol === "ADMIN" && (
              <NavItem
                to="/admin/usuarios"
                label="Usuarios"
                icon={Users}
                onNavigate={() => setSidebarOpen(false)}
              />
            )}
          </nav>
        </aside>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <Toaster />
      <footer className="border-t border-line bg-surface px-6 py-4 text-xs text-muted">
        <div className="flex flex-wrap items-center justify-between gap-y-3">
          <p className="leading-relaxed">
            ¿Tiene alguna duda, comentario o desea solicitar que se trabaje en una addenda?{" "}
            <a
              href="mailto:contact@builtbysori.me"
              className="font-medium text-accent transition-colors hover:underline"
            >
              contact@builtbysori.me
            </a>
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/legal/terminos" className="transition-colors hover:text-ink">
              Términos y condiciones
            </Link>
            <Link to="/legal/privacidad" className="transition-colors hover:text-ink">
              Privacidad
            </Link>
            <Link to="/legal/cookies" className="transition-colors hover:text-ink">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
