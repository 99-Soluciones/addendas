import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fieldsByScope } from "@addendex/shared";
import { Card, PageTitle } from "../../shared/components/ui/Card";
import { Button } from "../../shared/components/ui/Button";
import { EmailDialog } from "../../shared/components/ui/EmailDialog";
import { empresasApi } from "../../shared/api/empresas.api";
import { catalogosApi } from "../../shared/api/catalogos.api";
import { addendasApi } from "../../shared/api/addendas.api";
import { saveBlob } from "../../shared/lib/download";
import { ApiError } from "../../shared/api/client";
import { toast } from "../../stores/toast.store";
import type { CfdiPreview } from "../../shared/types";
import { SorianaAddendaForm } from "./forms/SorianaAddendaForm";
import { buildDatosComplementarios } from "./buildPayload";
import { CheckCircle2, Download, Mail, RotateCcw } from "lucide-react";

const selectClass =
  "rounded-md border border-line bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-accent";

type FormState = {
  empresaId: string;
  tipoId: string;
  fileName: string;
  cfdiXml: string;
  preview: CfdiPreview | null;
  globales: Record<string, string>;
  codigos: Record<number, string>;
  tarimaPorProducto: Record<number, string>;
  tarimas: { numero: string; codigoBarra: string }[];
  generated: { id: string; xml: string } | null;
};

const INITIAL_FORM: FormState = {
  empresaId: "",
  tipoId: "",
  fileName: "",
  cfdiXml: "",
  preview: null,
  globales: {},
  codigos: {},
  tarimaPorProducto: {},
  tarimas: [{ numero: "1", codigoBarra: "" }],
  generated: null,
};

export function NuevaAddendaPage() {
  const queryClient = useQueryClient();
  const { data: empresasData } = useQuery({ queryKey: ["empresas"], queryFn: empresasApi.list });

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const {
    empresaId,
    tipoId,
    fileName,
    cfdiXml,
    preview,
    globales,
    codigos,
    tarimaPorProducto,
    tarimas,
    generated,
  } = form;

  const [emailOpen, setEmailOpen] = useState(false);

  const patch = (partial: Partial<FormState>) => setForm((f) => ({ ...f, ...partial }));
  const reset = (partial?: Partial<FormState>) => setForm({ ...INITIAL_FORM, ...partial });

  const { data: tiposData } = useQuery({
    queryKey: ["catalogos", "tipos", empresaId],
    queryFn: () => catalogosApi.listTipos(empresaId),
    enabled: Boolean(empresaId),
  });

  const tipo = useMemo(
    () => tiposData?.tipos.find((t) => t.id === tipoId) ?? null,
    [tiposData, tipoId],
  );
  const isConsolidada = tipo?.nombre === "Consolidada";
  const globalFields = useMemo(
    () => (tipo ? fieldsByScope(tipo.configuracionCampos, "global") : []),
    [tipo],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewMut = useMutation({
    mutationFn: (xml: string) => addendasApi.preview(xml),
    onSuccess: (data) => {
      const bultos = data.conceptos.reduce((acc, c) => acc + parseFloat(c.Cantidad || "0"), 0);
      patch({
        preview: data,
        globales: { numeroBultos: String(bultos) },
        codigos: {},
        tarimaPorProducto: {},
        generated: null,
      });
    },
  });

  const createMut = useMutation({
    mutationFn: () =>
      addendasApi.create({
        tipoAddendaId: tipoId,
        empresaId,
        cfdiXml,
        nombreArchivo: fileName || undefined,
        datosGlobales: globales,
        datosComplementarios: preview
          ? buildDatosComplementarios(tipo?.empresa.nombre ?? "", {
              preview,
              codigos,
              tarimas,
              isConsolidada,
              tarimaPorProducto,
            })
          : {},
      }),
    onSuccess: (data) => {
      patch({ generated: data });
      queryClient.invalidateQueries({ queryKey: ["addendas"] });
    },
  });

  const downloadMut = useMutation({
    mutationFn: (id: string) => addendasApi.download(id),
    onSuccess: ({ blob, filename }) => saveBlob(blob, filename),
  });

  const emailMut = useMutation({
    mutationFn: (vars: { id: string; to: string }) => addendasApi.email(vars.id, vars.to),
    onSuccess: () => {
      setEmailOpen(false);
      queryClient.invalidateQueries({ queryKey: ["addendas"] });
      toast.success("Correo enviado correctamente.");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Error al enviar el correo.");
    },
  });

  const resetForm = () => {
    reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
    previewMut.reset();
    createMut.reset();
    downloadMut.reset();
    emailMut.reset();
  };

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!empresaId || !tipoId) {
      e.target.value = "";
      return;
    }
    const text = await file.text();
    patch({ fileName: file.name, cfdiXml: text });
    previewMut.mutate(text);
  }

  const empresas = empresasData?.empresas ?? [];
  const tipos = tiposData?.tipos ?? [];

  const canUpload = Boolean(empresaId && tipoId);
  const fileInputDisabled = !canUpload || previewMut.isSuccess;
  const fileInputFileClass = previewMut.isSuccess
    ? "file:bg-blue-900"
    : canUpload
      ? "file:bg-accent"
      : "file:bg-line file:cursor-not-allowed";

  return (
    <div className="mx-auto max-w-3xl">
      {emailOpen && (
        <EmailDialog
          loading={emailMut.isPending}
          onClose={() => setEmailOpen(false)}
          onSend={(to) => generated && emailMut.mutate({ id: generated.id, to })}
        />
      )}
      <PageTitle
        title="Nueva addenda"
        subtitle={`Empresa: ${empresas.find((e) => e.id === empresaId)?.nombre ?? ""}`}
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">Empresa</label>
            <select
              className={selectClass}
              value={empresaId}
              onChange={(e) => reset({ empresaId: e.target.value })}
            >
              <option value="">Selecciona…</option>
              {empresas.map((em) => (
                <option key={em.id} value={em.id}>
                  {em.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted">Tipo de addenda</label>
            <select
              className={selectClass}
              value={tipoId}
              onChange={(e) => patch({ tipoId: e.target.value })}
            >
              <option value="">Selecciona…</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm text-muted">Archivo XML (CFDI 4.0)</label>
          <Button variant="ghost" className="text-accent" onClick={resetForm}>
            <RotateCcw className="size-4 text-accent" />
            <span className="hidden sm:inline text-accent">Restablecer formulario</span>
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={onFile}
          className={`block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2 file:text-white ${fileInputFileClass}`}
          disabled={fileInputDisabled}
        />
        {!canUpload && (
          <p className="mt-2 text-xs text-muted">
            Selecciona empresa y tipo de addenda antes de subir un archivo.
          </p>
        )}
        {canUpload && previewMut.isSuccess && (
          <p className="mt-2 text-xs text-muted">
            Ya subiste un archivo. Usa "Restablecer formulario" si necesitas subir otro.
          </p>
        )}
        {previewMut.isPending && <p className="mt-2 text-xs text-muted">Leyendo XML…</p>}
        {previewMut.isError && (
          <p className="mt-2 text-xs text-danger">
            {previewMut.error instanceof ApiError
              ? previewMut.error.message
              : "Error al leer el XML"}
          </p>
        )}
        {preview && (
          <p className="mt-2 text-xs text-muted">
            Serie-Folio {preview.comprobante.Serie}-{preview.comprobante.Folio} · Subtotal{" "}
            {preview.comprobante.SubTotal} · {preview.conceptos.length} conceptos
          </p>
        )}
      </Card>

      {preview && tipo && (
        <>
          <SorianaAddendaForm
            preview={preview}
            globalFields={globalFields}
            globales={globales}
            onGlobalesChange={(globales) => patch({ globales })}
            codigos={codigos}
            onCodigosChange={(codigos) => patch({ codigos })}
            tipo={tipo}
            tarimaPorProducto={tarimaPorProducto}
            onTarimaPorProductoChange={(tarimaPorProducto) => patch({ tarimaPorProducto })}
            tarimas={tarimas}
            onTarimasChange={(tarimas) => patch({ tarimas })}
          />

          <Card>
            <div className="flex flex-col gap-3">
              {generated && (
                <div className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-2">
                  <CheckCircle2 className="size-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    Addenda generada correctamente
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {!generated && (
                  <Button
                    onClick={() => createMut.mutate()}
                    loading={createMut.isPending}
                    disabled={!empresaId || createMut.isPending}
                  >
                    Generar addenda
                  </Button>
                )}
                {generated && (
                  <>
                    <Button variant="secondary" onClick={() => downloadMut.mutate(generated.id)}>
                      <Download className="size-4" />
                      <span className="pt-1 sm:inline">Descargar XML</span>
                    </Button>
                    <Button variant="secondary" onClick={() => setEmailOpen(true)}>
                      <Mail className="size-4" />
                      <span className="pt-1 sm:inline">Enviar por email</span>
                    </Button>
                    <Button variant="ghost" onClick={resetForm}>
                      <RotateCcw className="size-4 text-accent" />
                      <span className="pt-1 sm:inline text-accent">Restablecer formulario</span>
                    </Button>
                  </>
                )}
                {createMut.isError && (
                  <span className="text-sm text-danger">
                    {createMut.error instanceof ApiError
                      ? createMut.error.message
                      : "Error al generar"}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
