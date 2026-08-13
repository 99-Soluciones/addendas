import { useEffect, useRef, useState } from "react";
import { X, Mail } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

interface EmailDialogProps {
  loading?: boolean;
  onClose: () => void;
  onSend: (to: string) => void;
}

/** El caller monta este componente solo mientras el diálogo está abierto,
 * para que el estado (email/error) nazca limpio en cada apertura sin
 * necesidad de resetearlo a mano en un efecto. */
export function EmailDialog({ loading = false, onClose, onSend }: EmailDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Ingresa un correo electrónico");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Correo electrónico inválido");
      return;
    }
    setError("");
    onSend(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-accent" />
            <span className="text-sm font-semibold">Enviar por correo</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <Input
            ref={inputRef}
            label="Correo destino"
            type="email"
            placeholder="ejemplo@empresa.com"
            value={email}
            error={error}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSend} loading={loading} disabled={loading}>
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
