import { useId, useState } from "react";
import { cn } from "../../utils/cn";

const variants = {
  dark: "bg-[var(--color-surface-inverse)] text-[var(--color-text-inverse)]",
  light:
    "bg-[var(--color-surface-default)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] shadow-[var(--shadow-md)]",
};

const sizes = {
  sm: "px-2 py-1 text-[length:var(--font-size-xs)]",
  md: "px-2.5 py-1.5 text-[length:var(--font-size-sm)]",
  lg: "px-3 py-2 text-[length:var(--font-size-base)]",
};

const placements = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

export default function Tooltip({
  children,
  content,
  variant = "dark",
  size = "md",
  placement = "top",
  disabled = false,
  className = "",
  ...props
}) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  const show = () => {
    if (!disabled && content) setOpen(true);
  };

  const hide = () => setOpen(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...props}
    >
      <span
        tabIndex={disabled ? -1 : 0}
        aria-describedby={open ? tooltipId : undefined}
        className={cn(
          "inline-flex outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-1 rounded-[var(--radius-sm)]",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        {children}
      </span>

      {open && content && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-[var(--z-tooltip)] whitespace-nowrap rounded-[var(--radius-md)]",
            "transition-[var(--transition-fast)]",
            variants[variant] ?? variants.dark,
            sizes[size] ?? sizes.md,
            placements[placement] ?? placements.top
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
