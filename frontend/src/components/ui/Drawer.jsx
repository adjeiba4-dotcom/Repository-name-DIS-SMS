import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

import { Body, H2 } from "./Typography";
import { cn } from "../../utils/cn";

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-xl",
  xl: "max-w-2xl",
};

/**
 * Right-side slide-over panel. Keeps page content mounted behind a light overlay.
 */
export default function Drawer({
  open = false,
  title = "",
  description = "",
  children,
  footer,
  size = "lg",
  disabled = false,
  className = "",
  onClose,
}) {
  const titleId = useId();
  const descriptionId = useId();
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
      className="fixed inset-0 flex justify-end"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <button
        type="button"
        aria-label="Close registration panel"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-surface-inverse)_35%,transparent)] transition-opacity duration-[var(--transition-normal)]"
        onClick={disabled ? undefined : onClose}
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex h-full w-full flex-col",
          "border-l border-[var(--color-border-default)] bg-[var(--color-surface-default)]",
          "shadow-[var(--shadow-xl)] focus:outline-none",
          sizes[size] ?? sizes.lg,
          disabled && "pointer-events-none opacity-70",
          className
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-[var(--space-3)] border-b border-[var(--color-border-default)] px-[var(--space-5)] py-[var(--space-4)] md:px-[var(--space-6)]">
          <div className="min-w-0 space-y-[var(--space-1)]">
            {title && (
              <H2 id={titleId} size="sm" className="truncate">
                {title}
              </H2>
            )}
            {description && (
              <Body id={descriptionId} variant="muted" size="sm" className="m-0">
                {description}
              </Body>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            aria-label="Close panel"
            className="rounded-[var(--radius-lg)] p-[var(--space-2)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] disabled:cursor-not-allowed"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-[var(--space-5)] py-[var(--space-5)] md:px-[var(--space-6)]">
          {children}
        </div>

        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-[var(--space-3)] border-t border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-[var(--space-5)] py-[var(--space-4)] md:px-[var(--space-6)]">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
