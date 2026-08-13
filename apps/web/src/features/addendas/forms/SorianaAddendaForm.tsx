import type { FieldDescriptor } from "@addendex/shared";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Input } from "../../../shared/components/ui/Input";
import type { CfdiPreview, TipoAddenda } from "../../../shared/types";
import { Select } from "../../../shared/components/ui/Select";

const selectClass =
  "rounded-md border border-line bg-elevated px-3 py-2 text-sm text-ink outline-none focus:border-accent";

export type SorianaTarima = { numero: string; codigoBarra: string };

interface SorianaAddendaFormProps {
  preview: CfdiPreview;
  globalFields: FieldDescriptor[];
  globales: Record<string, string>;
  onGlobalesChange: (globales: Record<string, string>) => void;
  codigos: Record<number, string>;
  onCodigosChange: (codigos: Record<number, string>) => void;
  tipo: TipoAddenda;
  tarimaPorProducto: Record<number, string>;
  onTarimaPorProductoChange: (tarimaPorProducto: Record<number, string>) => void;
  tarimas: SorianaTarima[];
  onTarimasChange: (tarimas: SorianaTarima[]) => void;
}

export function SorianaAddendaForm({
  preview,
  globalFields,
  globales,
  onGlobalesChange,
  codigos,
  onCodigosChange,
  tipo,
  tarimaPorProducto,
  onTarimaPorProductoChange,
  tarimas,
  onTarimasChange,
}: SorianaAddendaFormProps) {
  const isConsolidada = tipo?.nombre === "Consolidada";

  return (
    <>
      <Card className="mb-4">
        <h3 className="mb-4 text-sm font-semibold">Datos globales</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {globalFields.map((f) =>
            f.type === "select" ? (
              <Select
                key={f.name}
                label={f.label}
                value={globales[f.name] ?? ""}
                onChange={(e) => onGlobalesChange({ ...globales, [f.name]: e.target.value })}
                options={f.options ?? []}
              />
            ) : (
              <Input
                key={f.name}
                label={f.label}
                type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                value={globales[f.name] ?? ""}
                onChange={(e) => onGlobalesChange({ ...globales, [f.name]: e.target.value })}
              />
            ),
          )}
        </div>
      </Card>

      <Card className="mb-4">
        <h3 className="mb-4 text-sm font-semibold">Productos (asigna código)</h3>
        <div className="flex flex-col gap-3">
          {preview.conceptos.map((c) => (
            <div key={c.index} className="rounded-md border border-line p-3">
              <p className="text-sm">{c.Descripcion}</p>
              <p className="mb-2 text-xs text-muted">
                Cantidad {c.Cantidad} · Valor unitario {c.ValorUnitario}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  placeholder="Código (SKU/EAN)"
                  className={selectClass}
                  value={codigos[c.index] ?? ""}
                  onChange={(e) => onCodigosChange({ ...codigos, [c.index]: e.target.value })}
                />
                {isConsolidada && (
                  <input
                    type="number"
                    min="1"
                    placeholder="N° Tarima"
                    className={selectClass}
                    value={tarimaPorProducto[c.index] ?? "1"}
                    onChange={(e) =>
                      onTarimaPorProductoChange({
                        ...tarimaPorProducto,
                        [c.index]: e.target.value,
                      })
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {isConsolidada && (
        <Card className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Tarimas</h3>
            <Button
              variant="secondary"
              onClick={() =>
                onTarimasChange([
                  ...tarimas,
                  { numero: String(tarimas.length + 1), codigoBarra: "" },
                ])
              }
            >
              Agregar tarima
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {tarimas.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-16 text-sm text-muted">N° {t.numero}</span>
                <input
                  placeholder="Código de barras (SSCC)"
                  className={`${selectClass} flex-1`}
                  value={t.codigoBarra}
                  onChange={(e) =>
                    onTarimasChange(
                      tarimas.map((x, j) => (j === i ? { ...x, codigoBarra: e.target.value } : x)),
                    )
                  }
                />
                {tarimas.length > 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => onTarimasChange(tarimas.filter((_, j) => j !== i))}
                  >
                    Quitar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
