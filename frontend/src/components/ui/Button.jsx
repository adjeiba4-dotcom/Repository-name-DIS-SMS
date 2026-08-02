import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)] hover:bg-[var(--color-button-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
  secondary:
    "bg-[var(--color-button-secondary-bg)] text-[var(--color-button-secondary-text)] hover:bg-[var(--color-button-secondary-hover)]",
  success:
    "bg-[var(--color-success-600)] text-[var(--color-text-inverse)] hover:bg-[var(--color-success-700)] shadow-[var(--shadow-md)]",
  danger:
    "bg-[var(--color-button-danger-bg)] text-[var(--color-button-danger-text)] hover:bg-[var(--color-button-danger-hover)] shadow-[var(--shadow-md)]",
  outline:
    "border border-[var(--color-brand-600)] bg-transparent text-[var(--color-brand-700)] hover:bg-[var(--color-brand-50)]",
  ghost:
    "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]",
};

const sizes = {
  sm: "h-10 px-4 text-[length:var(--font-size-sm)] rounded-[var(--radius-lg)]",
  md: "h-12 px-6 text-[length:var(--font-size-base)] rounded-[var(--radius-xl)]",
  lg: "h-14 px-8 text-[length:var(--font-size-lg)] rounded-[var(--radius-xl)]",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={cn(
        "w-full font-[number:var(--font-weight-semibold)] transition-[var(--transition-normal)]",
        "active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "flex items-center justify-center gap-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
