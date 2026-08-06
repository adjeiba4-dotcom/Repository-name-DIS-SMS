import { cn } from "../../utils/cn";

/**
 * Token-based shimmer skeleton (square enterprise corners).
 */
export function Skeleton({ className = "" }) {
  return (
    <div className={cn("ds-skeleton", className)} aria-hidden />
  );
}

/** Single metric / content card placeholder */
export function CardSkeleton({ className = "" }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-panel)] border border-[var(--color-card-border)] bg-[var(--color-card-bg)] p-[var(--space-4)] shadow-[var(--shadow-sm)]",
        className
      )}
      aria-hidden
    >
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="mt-[var(--space-4)] space-y-[var(--space-2)]">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function StatCardsSkeleton({
  count = 4,
  label = "Loading metrics",
} = {}) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      className="space-y-[var(--space-3)]"
    >
      <div className="space-y-[var(--space-2)]">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export function DataTableSkeleton({
  rows = 6,
  label = "Loading directory",
} = {}) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="space-y-[var(--space-4)]"
    >
      <div className="-mx-[var(--space-6)] overflow-hidden">
        <div className="sticky top-0 border-y border-[var(--color-table-border)] bg-[var(--color-table-header-bg)] px-[var(--space-6)] py-[var(--space-3)]">
          <div className="grid grid-cols-4 gap-[var(--space-4)] md:grid-cols-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="hidden h-3 w-24 md:block" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="hidden h-3 w-16 lg:block" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="hidden h-3 w-16 xl:block" />
          </div>
        </div>
        <div className="divide-y divide-[var(--color-table-border)]">
          {Array.from({ length: rows }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-[var(--space-3)] px-[var(--space-6)] py-[var(--space-4)]",
                index % 2 === 1 && "bg-[var(--color-table-row-zebra)]"
              )}
            >
              <Skeleton className="h-8 w-8" />
              <div className="min-w-0 flex-1 space-y-[var(--space-2)]">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-3 w-56 max-w-full" />
              </div>
              <Skeleton className="hidden h-4 w-20 md:block" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--color-border-muted)] pt-[var(--space-4)]">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-48" />
      </div>
    </div>
  );
}

/** Two-column form field placeholders */
export function FormSkeleton({
  fields = 6,
  label = "Loading form",
  className = "",
} = {}) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className={cn("space-y-[var(--space-6)]", className)}
    >
      <div className="space-y-[var(--space-2)]">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
      <div className="ds-form-grid">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="ds-field">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-[var(--space-2)]">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

/** Compact inline field loading state (replaces spinners in forms) */
export function FormFieldSkeleton({
  label = "Loading field",
  className = "",
} = {}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("ds-field mb-5", className)}
    >
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-10 w-full" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageHeaderSkeleton({ label = "Loading page header" } = {}) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="ds-page-header"
    >
      <Skeleton className="h-3 w-40" />
      <div className="ds-page-header__body">
        <div className="space-y-[var(--space-2)]">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export function ProfileSkeleton({ label = "Loading profile" } = {}) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="space-y-[var(--space-6)]"
    >
      <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-panel)] border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-[var(--space-4)]">
        <Skeleton className="h-12 w-12" />
        <div className="flex-1 space-y-[var(--space-2)]">
          <Skeleton className="h-5 w-48 max-w-full" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>

      {[1, 2, 3].map((section) => (
        <div key={section} className="space-y-[var(--space-4)]">
          <Skeleton className="h-5 w-28" />
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-[var(--space-3)]">
                <Skeleton className="h-8 w-8" />
                <div className="flex-1 space-y-[var(--space-2)]">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Aliases kept for Students module compatibility. */
export function StudentTableSkeleton({ rows = 6 } = {}) {
  return (
    <DataTableSkeleton rows={rows} label="Loading student directory" />
  );
}

export function StudentProfileSkeleton(props) {
  return <ProfileSkeleton label="Loading student profile" {...props} />;
}

export default Skeleton;
