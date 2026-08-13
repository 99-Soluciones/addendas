import { useQuery } from "@tanstack/react-query";
import { Card, PageTitle } from "../../shared/components/ui/Card";
import { usersApi } from "../../shared/api/users.api";

export function UsersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: usersApi.list,
  });

  return (
    <div>
      <PageTitle title="Usuarios" subtitle="Usuarios registrados en la plataforma" />
      <Card>
        {isLoading && <p className="text-sm text-muted">Cargando...</p>}
        {isError && <p className="text-sm text-danger">No se pudieron cargar los usuarios.</p>}
        {data && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="pb-2 font-medium">Nombre</th>
                <th className="pb-2 font-medium">Correo</th>
                <th className="pb-2 font-medium">Rol</th>
                <th className="pb-2 font-medium">Addendas</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((u) => (
                <tr key={u.id} className="border-t border-line">
                  <td className="py-2">{u.nombre}</td>
                  <td className="py-2">{u.correo}</td>
                  <td className="py-2">{u.rol}</td>
                  <td className="py-2">{u._count.addendas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
