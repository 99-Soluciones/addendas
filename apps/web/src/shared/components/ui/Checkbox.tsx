import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, className = "", id, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex items-start gap-2 text-sm">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={`mt-0.5 size-4 shrink-0 accent-[var(--color-accent)] ${className}`}
          {...props}
        />
        <span className="text-muted">{label}</span>
      </label>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});
