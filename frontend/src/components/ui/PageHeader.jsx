import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { cn } from "../../utils/cn";

/**
 * Reusable module page header for every feature under AppShell.
 *
 * Supports breadcrumbs, title, description, primary CTA, and action slots.
 *
 * @example
 * <PageHeader
 *   eyebrow="Academics"
 *   title="Students"
 *   description="Manage learner records."
 *   breadcrumbs={[{ label: "Home", to: "/" }, { label: "Students" }]}
 *   primaryAction={{ label: "Add Student", onClick, icon: Plus }}
 * />
 */
export default function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  primaryAction,
  breadcrumbs,
  variant = "default",
  size: _size = "md",
  disabled = false,
  className = "",
  ...props
}) {
  const crumbs = Array.isArray(breadcrumbs) ? breadcrumbs : null;
  const customCrumbs = !crumbs && breadcrumbs ? breadcrumbs : null;
  const PrimaryIcon = primaryAction?.icon;

  return (
    <header
      aria-disabled={disabled || undefined}
      className={cn(
        "ds-page-header",
        variant === "plain" && "ds-page-header--plain",
        variant === "muted" && "bg-[var(--color-surface-muted)]",
        disabled && "pointer-events-none opacity-60",
        className
      )}
      {...props}
    >
      {crumbs && crumbs.length > 0 && (
        <nav className="ds-breadcrumb" aria-label="Page breadcrumb">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;

            return (
              <span key={`${crumb.label}-${index}`} className="contents">
                {index > 0 && (
                  <ChevronRight
                    size={14}
                    className="ds-breadcrumb__sep shrink-0"
                    aria-hidden
                  />
                )}
                {crumb.to && !isLast ? (
                  <Link to={crumb.to} className="ds-breadcrumb__link">
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLast ? "ds-breadcrumb__current" : "ds-breadcrumb__link"
                    }
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {customCrumbs && (
        <nav aria-label="Page breadcrumb">{customCrumbs}</nav>
      )}

      <div className="ds-page-header__body">
        <div className="ds-page-header__copy">
          {eyebrow ? (
            <p className="ds-page-header__eyebrow">{eyebrow}</p>
          ) : null}

          {typeof title === "string" ? (
            <h1 className="ds-page-header__title">{title}</h1>
          ) : (
            title
          )}

          {description &&
            (typeof description === "string" ? (
              <p className="ds-page-header__description">{description}</p>
            ) : (
              description
            ))}
        </div>

        {(actions || primaryAction) && (
          <div className="ds-page-header__actions">
            {actions}
            {primaryAction ? (
              <button
                type="button"
                className="ds-page-header__primary"
                onClick={primaryAction.onClick}
                disabled={disabled || primaryAction.disabled}
              >
                {PrimaryIcon ? <PrimaryIcon size={16} aria-hidden /> : null}
                {primaryAction.label}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
