import { cn } from "../../utils/cn";

const variants = {
  primary: "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]",
  success: "bg-[var(--color-success-100)] text-[var(--color-success-700)]",
  warning: "bg-[var(--color-warning-100)] text-[var(--color-warning-700)]",
  danger: "bg-[var(--color-danger-100)] text-[var(--color-danger-700)]",
  info: "bg-[var(--color-info-100)] text-[var(--color-info-700)]",
  secondary: "bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]",
};

const sizes = {
  sm: "px-2 py-0.5 text-[length:var(--font-size-xs)]",
  md: "px-3 py-1 text-[length:var(--font-size-xs)]",
  lg: "px-3.5 py-1.5 text-[length:var(--font-size-sm)]",
};

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  rounded = true,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <span
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex items-center font-[number:var(--font-weight-semibold)]",
        rounded ? "rounded-[var(--radius-full)]" : "rounded-[var(--radius-lg)]",
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        disabled && "opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
