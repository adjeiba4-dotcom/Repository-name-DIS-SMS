import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/cn";

export default function PasswordInput({
    label,
    name,
    value,
    onChange,
    placeholder = "Enter password",
    error = "",
    disabled = false,
    required = false,
    className = "",
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={cn("mb-5", className)}>
            {label && (
                <label
                    htmlFor={name}
                    className="mb-2 block text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)]"
                >
                    {label}
                    {required && (
                        <span className="ml-1 text-[var(--color-danger-500)]" aria-hidden="true">
                            *
                        </span>
                    )}
                </label>
            )}

            <div
                className={cn(
                    "flex items-center rounded-[var(--radius-lg)] border bg-[var(--color-input-bg)]",
                    "transition-[var(--transition-normal)]",
                    error
                        ? "border-[var(--color-danger-500)]"
                        : "border-[var(--color-input-border)] focus-within:border-[var(--color-input-border-focus)]"
                )}
            >
                <input
                    id={name}
                    name={name}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={cn(
                        "h-12 w-full bg-transparent px-4 text-[var(--color-input-text)] outline-none",
                        "placeholder:text-[var(--color-input-placeholder)]",
                        "disabled:cursor-not-allowed"
                    )}
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 text-[var(--color-text-muted)] transition-[var(--transition-fast)] hover:text-[var(--color-text-secondary)]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {error && (
                <p className="mt-2 text-[length:var(--font-size-sm)] text-[var(--color-danger-600)]">
                    {error}
                </p>
            )}
        </div>
    );
}
