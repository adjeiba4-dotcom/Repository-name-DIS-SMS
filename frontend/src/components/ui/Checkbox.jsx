import clsx from "clsx";

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
            className={clsx(
                "flex items-center gap-3 cursor-pointer select-none",
                disabled && "cursor-not-allowed opacity-60"
            )}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="
                    h-5
                    w-5
                    rounded
                    border-slate-300
                    text-blue-600
                    focus:ring-2
                    focus:ring-blue-200
                "
            />

            <span className="text-sm font-medium text-slate-700">
                {label}
            </span>
        </label>
    );
}