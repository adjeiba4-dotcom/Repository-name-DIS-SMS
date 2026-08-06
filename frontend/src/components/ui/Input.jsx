import { useId } from "react";
import { cn } from "../../utils/cn";

const variants = {
  default: "",
  filled: "bg-[var(--color-surface-muted)]",
  ghost: "border-transparent bg-transparent shadow-none",
};

const sizes = {
  sm: "h-10 text-[length:var(--font-size-sm)]",
  md: "h-12 text-[length:var(--font-size-base)]",
  lg: "h-14 text-[length:var(--font-size-lg)]",
};

export default function Input({
  label,
  type = "text",
  name,
  id,
  placeholder = "",
  value,
  onChange,
  error = "",
  disabled = false,
  required = false,
  leftIcon = null,
  rightIcon = null,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = id || name || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cn("mb-5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="ds-field__label mb-2"
        >
          {label}
          {required && (
            <span className="ds-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={cn(
          "flex items-center rounded-[var(--radius-control)] border bg-[var(--color-input-bg)]",
          "transition-[var(--transition-normal)]",
          error
            ? "border-[var(--color-danger-500)]"
            : "border-[var(--color-input-border)] focus-within:border-[var(--color-input-border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-ocean-blue-soft)]",
          disabled && "bg-[var(--color-input-disabled-bg)] opacity-70",
          variants[variant]
        )}
      >
        {leftIcon && (
          <div className="shrink-0 pl-4 text-[var(--color-text-muted)]" aria-hidden="true">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          aria-required={required || undefined}
          className={cn(
            "w-full rounded-[var(--radius-control)] bg-transparent px-4 text-[var(--color-input-text)] outline-none",
            "placeholder:text-[var(--color-input-placeholder)]",
            "disabled:cursor-not-allowed",
            sizes[size] ?? sizes.md
          )}
          {...props}
        />

        {rightIcon && (
          <div className="shrink-0 pr-4 text-[var(--color-text-muted)]" aria-hidden="true">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-[length:var(--font-size-sm)] text-[var(--color-danger-600)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
