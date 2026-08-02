import { cn } from "../../utils/cn";

const variants = {
  /** Glass / auth surface — preserves existing login card look */
  glass:
    "border border-white/25 bg-white/12 backdrop-blur-2xl shadow-[0_25px_60px_rgba(15,23,42,0.45)]",
  default:
    "border border-[var(--color-card-border)] bg-[var(--color-card-bg)] shadow-[var(--color-card-shadow)]",
  outlined:
    "border border-[var(--color-card-border)] bg-[var(--color-card-bg)] shadow-none",
  muted:
    "border border-[var(--color-border-muted)] bg-[var(--color-surface-muted)] shadow-none",
};

const sizes = {
  sm: "rounded-[var(--radius-lg)]",
  md: "rounded-[var(--radius-xl)]",
  lg: "rounded-[32px]",
};

const paddings = {
  sm: "p-4",
  md: "p-6",
  lg: "p-10",
};

export default function Card({
  children,
  variant = "glass",
  size = "lg",
  className = "",
  disabled = false,
  ...props
}) {
  const isGlass = variant === "glass";

  return (
    <div
      aria-disabled={disabled || undefined}
      className={cn(
        "relative w-full max-w-[500px] overflow-hidden",
        sizes[size] ?? sizes.lg,
        variants[variant] ?? variants.glass,
        disabled && "pointer-events-none opacity-60",
        className
      )}
      {...props}
    >
      {isGlass && (
        <>
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-[var(--color-brand-500)]/10"
            aria-hidden="true"
          />
        </>
      )}

      {/* Glass keeps legacy inner padding so Login / auth cards stay unchanged */}
      <div
        className={cn(
          "relative z-10",
          isGlass ? "p-10" : paddings[size] ?? paddings.md
        )}
      >
        {children}
      </div>
    </div>
  );
}
