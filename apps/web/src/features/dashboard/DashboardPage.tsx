import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Building2, FileText, Plus, TrendingUp } from "lucide-react";
import { Card, PageTitle } from "../../shared/components/ui/Card";
import { Button } from "../../shared/components/ui/Button";
import { dashboardApi } from "../../shared/api/dashboard.api";
import { useAuthStore } from "../../stores/auth.store";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="flex items-center gap-4">
      <span className="grid size-10 place-items-center rounded-md bg-elevated text-accent">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data } = useQuery({ queryKey: ["dashboard", "stats"], queryFn: dashboardApi.stats });

  return (
    <div>
      <PageTitle title={`Hola, ${user?.nombre ?? ""}`} subtitle="Resumen de tu actividad" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Addendas generadas"
          value={data ? String(data.total) : "—"}
          icon={FileText}
        />
        <StatCard label="Este mes" value={data ? String(data.esteMes) : "—"} icon={TrendingUp} />
        <StatCard label="Empresa favorita" value={data?.empresa_mas_uso ?? "—"} icon={Building2} />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-sm font-semibold">Últimas addendas</h3>
          <Link to="/addendas/nueva">
            <Button>
              <Plus className="size-4" />
              <span className="sm:inline">Nueva</span>
            </Button>
          </Link>
        </div>
        {data && data.recientes.length > 0 ? (
          <ul className="mt-4 divide-y divide-line">
            {data.recientes.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <span className="text-ink">{r.folio ?? "—"}</span>
                  <span className="text-muted">
                    {" "}
                    · {r.tipo} · {r.empresa}
                  </span>
                </span>
                <span className="text-muted">{new Date(r.fecha).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">Aún no hay addendas generadas.</p>
        )}
      </Card>
    </div>
  );
}
