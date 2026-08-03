import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { Body, Caption, H3 } from "../ui/Typography";
import { cn } from "../../utils/cn";

const TONE_STYLES = {
  brand: {
    iconWrap: "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]",
    badge: "primary",
  },
  success: {
    iconWrap: "bg-[var(--color-success-100)] text-[var(--color-success-700)]",
    badge: "success",
  },
  warning: {
    iconWrap: "bg-[var(--color-warning-100)] text-[var(--color-warning-700)]",
    badge: "warning",
  },
  info: {
    iconWrap: "bg-[var(--color-info-100)] text-[var(--color-info-700)]",
    badge: "info",
  },
};

/**
 * KPI / metric card for dashboard surfaces.
 */
export default function StatCard({
  label,
  value,
  hint,
  trend,
  tone = "brand",
  icon: Icon,
  className = "",
  ...props
}) {
  const toneStyles = TONE_STYLES[tone] ?? TONE_STYLES.brand;

  return (
    <Card
      variant="default"
      size="sm"
      className={cn(
        "transition-[box-shadow,transform] duration-[var(--transition-normal)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        {Icon && (
          <div
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)]",
              toneStyles.iconWrap
            )}
            aria-hidden
          >
            <Icon size={18} />
          </div>
        )}
        {trend && (
          <Badge variant={toneStyles.badge} size="sm">
            {trend}
          </Badge>
        )}
      </div>

      <div className="mt-[var(--space-4)] space-y-[var(--space-1)]">
        {label && (
          <Caption
            variant="muted"
            size="sm"
            className="m-0 font-[number:var(--font-weight-medium)] uppercase tracking-[0.06em]"
          >
            {label}
          </Caption>
        )}
        <H3 size="md" className="tabular-nums tracking-tight">
          {value}
        </H3>
        {hint && (
          <Body variant="muted" size="sm" className="m-0">
            {hint}
          </Body>
        )}
      </div>
    </Card>
  );
}
