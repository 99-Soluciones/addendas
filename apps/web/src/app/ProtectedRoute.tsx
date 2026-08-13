import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../stores/auth.store";
import type { Rol } from "../shared/types";

export function ProtectedRoute({ roles }: { roles?: Rol[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
