import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Mail, Plus } from "lucide-react";
import { Card } from "../../shared/components/ui/Card";
import { Button } from "../../shared/components/ui/Button";
import { EmailDialog } from "../../shared/components/ui/EmailDialog";
import { addendasApi } from "../../shared/api/addendas.api";
import { saveBlob } from "../../shared/lib/download";
import { ApiError } from "../../shared/api/client";
import { toast } from "../../stores/toast.store";

export function AddendasPage() {
  const [emailTarget, setEmailTarget] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["addendas"],
    queryFn: addendasApi.list,
  });

  const download = useMutation({
    mutationFn: (id: string) => addendasApi.download(id),
    onSuccess: ({ blob, filename }) => saveBlob(blob, filename),
  });

  const email = useMutation({
    mutationFn: (vars: { id: string; to: string }) => addendasApi.email(vars.id, vars.to),
    onSuccess: () => {
      setEmailTarget(null);
      refetch();
      toast.success("Correo enviado correctamente.");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Error al enviar el correo.");
    },
  });

  return (
    <div>
      {emailTarget !== null && (
        <EmailDialog
          loading={email.isPending}
          onClose={() => setEmailTarget(null)}
          onSend={(to) => email.mutate({ id: emailTarget!, to })}
        />
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Addendas</h1>
          <p className="mt-1 text-sm text-muted">Historial de addendas generadas</p>
        </div>
        <Link to="/addendas/nueva">
          <Button>
            <Plus className="size-4" />
            Nueva
          </Button>
        </Link>
      </div>

      <Card>
        {isLoading && <p className="text-sm text-muted">Cargando...</p>}
        {data && data.addendas.length === 0 && (
          <p className="text-sm text-muted">Aún no hay addendas generadas.</p>
        )}
        {data && data.addendas.length > 0 && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="pb-2 font-medium">Folio</th>
                    <th className="pb-2 font-medium">Tipo</th>
                    <th className="pb-2 font-medium">Empresa</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.addendas.map((a) => (
                    <tr key={a.id} className="border-t border-line">
                      <td className="py-2">
                        {a.informacionXml
                          ? `${a.informacionXml.serieCfdi ?? ""}-${a.informacionXml.folioCfdi ?? ""}`
                          : "—"}
                      </td>
                      <td className="py-2">{a.tipoAddenda.nombre}</td>
                      <td className="py-2">{a.empresa.nombre}</td>
                      <td className="py-2">{a.estado}</td>
                      <td className="py-2">{new Date(a.fechaGeneracion).toLocaleDateString()}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <Button variant="primary" onClick={() => download.mutate(a.id)}>
                            <Download className="size-4" />
                            XML
                          </Button>
                          <Button variant="primary" onClick={() => setEmailTarget(a.id)}>
                            <Mail className="size-4" />
                            Correo
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {data.addendas.map((a) => (
                <div key={a.id} className="rounded-md border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {a.informacionXml
                        ? `${a.informacionXml.serieCfdi ?? ""}-${a.informacionXml.folioCfdi ?? ""}`
                        : "—"}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(a.fechaGeneracion).toLocaleDateString()}
                    </span>
                  </div>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-muted">Tipo</dt>
                    <dd>{a.tipoAddenda.nombre}</dd>
                    <dt className="text-muted">Empresa</dt>
                    <dd>{a.empresa.nombre}</dd>
                    <dt className="text-muted">Estado</dt>
                    <dd>{a.estado}</dd>
                  </dl>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => download.mutate(a.id)}
                    >
                      <Download className="size-4" />
                      XML
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => setEmailTarget(a.id)}
                    >
                      <Mail className="size-4" />
                      Correo
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
