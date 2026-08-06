import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/cn";

export default function PasswordInput({
  label,
  name,
  id,
  value,
  onChange,
  placeholder = "Enter password",
  error = "",
  disabled = false,
  required = false,
  leftIcon = null,
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = id || name || generatedId;

  return (
    <div className={cn("mb-5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[var(--color-danger-500)]" aria-hidden="true">
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
            : "border-[var(--color-input-border)] focus-within:border-[var(--color-input-border-focus)] focus-within:ring-2 focus-within:ring-[var(--color-ocean-blue-soft)]"
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
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-12 w-full bg-transparent px-4 text-[var(--color-input-text)] outline-none",
            "placeholder:text-[var(--color-input-placeholder)]",
            "disabled:cursor-not-allowed"
          )}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="shrink-0 px-3 text-[var(--color-text-muted)] transition-[var(--transition-fast)] hover:text-[var(--color-text-secondary)]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-[length:var(--font-size-sm)] text-[var(--color-danger-600)]">
          {error}
        </p>
      )}
    </div>
  );
}
