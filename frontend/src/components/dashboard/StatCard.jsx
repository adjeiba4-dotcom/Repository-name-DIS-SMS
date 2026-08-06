import Badge from "../ui/Badge";
import Card from "../ui/Card";
import AnimatedCounter from "../ui/AnimatedCounter";
import { Body, Caption, H3 } from "../ui/Typography";
import { cn } from "../../utils/cn";

const TONE_STYLES = {
  ocean: {
    iconWrap: "ds-kpi-icon ds-kpi-icon--ocean",
    badge: "primary",
  },
  yellow: {
    iconWrap: "ds-kpi-icon ds-kpi-icon--yellow",
    badge: "warning",
  },
  cyan: {
    iconWrap: "ds-kpi-icon ds-kpi-icon--cyan",
    badge: "info",
  },
  lime: {
    iconWrap: "ds-kpi-icon ds-kpi-icon--lime",
    badge: "success",
  },
  red: {
    iconWrap: "ds-kpi-icon ds-kpi-icon--red",
    badge: "danger",
  },
  brand: {
    iconWrap: "ds-kpi-icon ds-kpi-icon--ocean",
    badge: "primary",
  },
  success: {
    iconWrap: "ds-kpi-icon ds-kpi-icon--lime",
    badge: "success",
  },
  warning: {
    iconWrap: "ds-kpi-icon ds-kpi-icon--yellow",
    badge: "warning",
  },
  info: {
    iconWrap: "ds-kpi-icon ds-kpi-icon--cyan",
    badge: "info",
  },
};

/**
 * KPI / metric card for dashboard surfaces — square enterprise panel.
 * Numeric values animate via AnimatedCounter when `animate` is true.
 */
export default function StatCard({
  label,
  value,
  hint,
  trend,
  tone = "ocean",
  icon: Icon,
  animate = true,
  className = "",
  ...props
}) {
  const toneStyles = TONE_STYLES[tone] ?? TONE_STYLES.ocean;

  return (
    <Card
      variant="default"
      size="sm"
      className={cn(
        "transition-[box-shadow] duration-[var(--transition-normal)] hover:shadow-[var(--shadow-md)]",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        {Icon && (
          <div className={toneStyles.iconWrap} aria-hidden>
            <Icon size={18} />
          </div>
        )}
        {trend && (
          <Badge variant={toneStyles.badge} size="sm" rounded={false}>
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
        <H3 size="md" className="tracking-tight">
          <AnimatedCounter value={value} animate={animate} />
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
