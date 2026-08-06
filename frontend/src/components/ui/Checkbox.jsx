import { cn } from "../../utils/cn";

export default function Checkbox({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer select-none items-center gap-3",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded-[var(--radius-none)] border-[var(--color-input-border)] text-[var(--color-ocean-blue)] accent-[var(--color-ocean-blue)] focus:ring-2 focus:ring-[var(--color-ocean-blue-soft)] focus:ring-offset-0"
      />

      <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-medium)] text-[var(--color-text-secondary)]">
        {label}
      </span>
    </label>
  );
}
