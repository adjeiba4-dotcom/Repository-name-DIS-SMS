import { GraduationCap } from "lucide-react";

export default function Logo() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[var(--radius-panel)] bg-[var(--color-ocean-blue)]">
        <GraduationCap
          size={24}
          strokeWidth={1.75}
          className="text-[var(--color-text-inverse)]"
        />
      </div>

      <h1 className="mt-6 font-[family-name:var(--font-family-display)] text-[length:var(--font-size-2xl)] font-[number:var(--font-weight-bold)] leading-[var(--line-height-tight)] tracking-tight text-[var(--color-text-primary)]">
        DIS-SMS ERP
      </h1>

      <p className="mt-2 text-[length:var(--font-size-sm)] font-[number:var(--font-weight-medium)] tracking-wide text-[var(--color-text-muted)]">
        Enterprise School Management System
      </p>
    </div>
  );
}
