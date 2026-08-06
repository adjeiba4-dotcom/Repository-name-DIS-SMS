import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

const variants = {
  circular: "rounded-[var(--radius-full)]",
  rounded: "rounded-[var(--radius-lg)]",
  square: "rounded-[var(--radius-panel)]",
};

const sizes = {
  sm: "h-8 w-8 text-[length:var(--font-size-xs)]",
  md: "h-10 w-10 text-[length:var(--font-size-sm)]",
  lg: "h-12 w-12 text-[length:var(--font-size-base)]",
  xl: "h-16 w-16 text-[length:var(--font-size-lg)]",
};

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Avatar with photo support and graceful initials fallback.
 */
export default function Avatar({
  src,
  alt = "",
  name = "",
  variant = "circular",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getInitials(name || alt);
  const showImage = Boolean(src) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  return (
    <span
      role="img"
      aria-label={alt || name || "Avatar"}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        "bg-[var(--color-brand-100)] font-[number:var(--font-weight-semibold)] text-[var(--color-brand-700)]",
        "ring-1 ring-[var(--color-border-default)]",
        variants[variant] ?? variants.circular,
        sizes[size] ?? sizes.md,
        disabled && "opacity-50 grayscale",
        className
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name || ""}
          className="h-full w-full object-cover"
          draggable={false}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
}
