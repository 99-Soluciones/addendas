import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { tryRefresh } from "../shared/api/client";

/** Rehidrata la sesión al cargar (refresh silencioso con la cookie httpOnly). */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const { isFetched } = useQuery({
    queryKey: ["auth", "bootstrap"],
    queryFn: tryRefresh,
    retry: false,
    staleTime: Infinity,
  });

  if (!isFetched) {
    return <div className="grid min-h-screen place-items-center text-muted">Cargando...</div>;
  }
  return <>{children}</>;
}
