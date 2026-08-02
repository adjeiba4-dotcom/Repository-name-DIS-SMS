import { GraduationCap } from "lucide-react";

export default function Logo() {
    return (
        <div className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand-600)]">
                <GraduationCap
                    size={22}
                    className="text-[var(--color-text-inverse)]"
                />
            </div>

            <h1 className="mt-6 text-[var(--font-size-xl)] font-[var(--font-weight-bold)] leading-[var(--line-height-tight)] text-[var(--color-text-primary)]">
                DIS-SMS ERP
            </h1>

            <p className="mt-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                Enterprise School Management System
            </p>
        </div>
    );
}
