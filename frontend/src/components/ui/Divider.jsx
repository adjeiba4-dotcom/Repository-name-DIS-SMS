import clsx from "clsx";

export default function Divider({
    label = "",
    className = "",
}) {
    return (
        <div
            className={clsx(
                "flex items-center gap-4 py-4",
                className
            )}
        >
            <div className="h-px flex-1 bg-slate-200"></div>

            {label && (
                <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                    {label}
                </span>
            )}

            <div className="h-px flex-1 bg-slate-200"></div>
        </div>
    );
}