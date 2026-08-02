import { cn } from "../../utils/cn";

const variants = {
  primary: "border-[var(--color-brand-600)] border-t-transparent",
  secondary: "border-[var(--color-border-strong)] border-t-transparent",
  inverse: "border-[var(--color-text-inverse)] border-t-transparent",
  success: "border-[var(--color-success-600)] border-t-transparent",
  danger: "border-[var(--color-danger-600)] border-t-transparent",
};

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
};

export default function Spinner({
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  label = "Loading",
}) {
  return (
    <div
      className={cn("flex justify-center", disabled && "opacity-50", className)}
      role="status"
      aria-live="polite"
      aria-busy={!disabled}
      aria-label={label}
    >
      <div
        className={cn(
          "animate-spin rounded-full",
          variants[variant] ?? variants.primary,
          sizes[size] ?? sizes.md
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
