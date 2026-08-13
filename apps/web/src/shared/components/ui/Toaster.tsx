import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useToastStore } from "../../../stores/toast.store";
import type { ToastVariant } from "../../../stores/toast.store";

const iconMap: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colorMap: Record<ToastVariant, string> = {
  success: "text-success border-l-success",
  error: "text-danger border-l-danger",
  info: "text-accent border-l-accent",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = iconMap[t.variant];
        const colors = colorMap[t.variant];
        return (
          <div
            key={t.id}
            className={`flex min-w-64 max-w-sm items-start gap-3 rounded-lg border border-line border-l-4 bg-surface px-4 py-3 shadow-lg ${colors}`}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <span className="flex-1 text-sm text-ink">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="ml-1 shrink-0 text-muted transition-colors hover:text-ink"
              aria-label="Cerrar"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
