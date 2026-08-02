import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

const sizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

const variants = {
  default: "bg-[var(--color-surface-default)]",
  muted: "bg-[var(--color-surface-muted)]",
};

export default function Modal({
  open = false,
  title = "",
  children,
  footer,
  size = "md",
  variant = "default",
  disabled = false,
  className = "",
  onClose,
}) {
  const titleId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !disabled) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, disabled, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[var(--color-surface-inverse)]/50 p-4"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <div
        className="absolute inset-0"
        onClick={disabled ? undefined : onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--shadow-xl)]",
          "focus:outline-none",
          variants[variant] ?? variants.default,
          sizes[size] ?? sizes.md,
          disabled && "pointer-events-none opacity-70",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border-default)] px-6 py-4">
          <h2
            id={titleId}
            className="text-[length:var(--font-size-xl)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-primary)]"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            aria-label="Close dialog"
            className="rounded-[var(--radius-lg)] p-2 text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:cursor-not-allowed"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 text-[var(--color-text-primary)]">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
