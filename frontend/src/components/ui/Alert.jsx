import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../../utils/cn";

const variants = {
  success: {
    icon: CheckCircle,
    wrapper:
      "bg-[var(--color-success-50)] border-[var(--color-success-100)] text-[var(--color-success-text)]",
    iconColor: "text-[var(--color-success-600)]",
    role: "status",
  },
  error: {
    icon: AlertCircle,
    wrapper:
      "bg-[var(--color-danger-50)] border-[var(--color-danger-100)] text-[var(--color-danger-text)]",
    iconColor: "text-[var(--color-danger-600)]",
    role: "alert",
  },
  warning: {
    icon: AlertTriangle,
    wrapper:
      "bg-[var(--color-warning-50)] border-[var(--color-warning-100)] text-[var(--color-warning-text)]",
    iconColor: "text-[var(--color-warning-600)]",
    role: "alert",
  },
  info: {
    icon: Info,
    wrapper:
      "bg-[var(--color-info-50)] border-[var(--color-info-100)] text-[var(--color-info-text)]",
    iconColor: "text-[var(--color-info-600)]",
    role: "status",
  },
};

const sizes = {
  sm: "gap-3 p-3 text-[length:var(--font-size-sm)]",
  md: "gap-4 p-4 text-[length:var(--font-size-sm)]",
  lg: "gap-4 p-5 text-[length:var(--font-size-base)]",
};

export default function Alert({
  variant = "info",
  size = "md",
  title,
  message,
  closable = false,
  onClose,
  disabled = false,
  className = "",
}) {
  if (!message) return null;

  const config = variants[variant] ?? variants.info;
  const Icon = config.icon;

  return (
    <div
      role={config.role}
      aria-disabled={disabled || undefined}
      className={cn(
        "mb-4 flex items-start rounded-[var(--radius-xl)] border shadow-[var(--shadow-sm)]",
        config.wrapper,
        sizes[size] ?? sizes.md,
        disabled && "opacity-60",
        className
      )}
    >
      <Icon size={22} className={config.iconColor} aria-hidden="true" />

      <div className="flex-1">
        {title && (
          <h4 className="mb-1 font-[number:var(--font-weight-semibold)]">{title}</h4>
        )}
        <p>{message}</p>
      </div>

      {closable && (
        <button
          type="button"
          onClick={onClose}
          disabled={disabled}
          aria-label="Dismiss alert"
          className="rounded-[var(--radius-md)] transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:cursor-not-allowed"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
