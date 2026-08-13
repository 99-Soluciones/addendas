import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, className = "", id, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-muted">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`rounded-md border bg-elevated px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent ${
          error ? "border-danger" : "border-line"
        } ${className}`}
        {...props}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});
