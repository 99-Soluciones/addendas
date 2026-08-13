import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../stores/auth.store";
import { ThemeToggle } from "../../shared/components/ThemeToggle";

export function AuthLayout() {
  const user = useAuthStore((s) => s.user);
  if (user) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="relative grid min-h-screen place-items-center bg-base px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            <div className="flex items-center justify-center">
              <img src="/favicon.svg" alt="99 Soluciones" className="h-38 w-auto mb-2" />
            </div>
          </h1>
          <p className="text-sm text-muted">Generador de addendas CFDI 4.0</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
