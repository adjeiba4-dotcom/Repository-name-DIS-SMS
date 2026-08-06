import AnimatedCounter from "../ui/AnimatedCounter";
import { cn } from "../../utils/cn";

const TONE_ICON = {
  ocean: "ds-kpi-icon ds-kpi-icon--ocean",
  yellow: "ds-kpi-icon ds-kpi-icon--yellow",
  cyan: "ds-kpi-icon ds-kpi-icon--cyan",
  lime: "ds-kpi-icon ds-kpi-icon--lime",
  red: "ds-kpi-icon ds-kpi-icon--red",
  brand: "ds-kpi-icon ds-kpi-icon--ocean",
  success: "ds-kpi-icon ds-kpi-icon--lime",
  warning: "ds-kpi-icon ds-kpi-icon--yellow",
  info: "ds-kpi-icon ds-kpi-icon--cyan",
};

/**
 * Compact horizontal statistics strip — reusable across module pages.
 *
 * items: [{ id?, label, value, hint?, tone?, icon? }]
 */
export default function StatsStrip({
  items = [],
  animate = true,
  className = "",
  ...props
}) {
  if (!items.length) return null;

  return (
    <div className={cn("ds-stats-strip", className)} {...props}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const toneClass = TONE_ICON[item.tone] ?? TONE_ICON.ocean;

        return (
          <div
            key={item.id ?? `${item.label}-${index}`}
            className="ds-stats-strip__item"
          >
            {Icon ? (
              <div className={toneClass} aria-hidden>
                <Icon size={18} />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="ds-stats-strip__label">{item.label}</p>
              <p className="ds-stats-strip__value">
                <AnimatedCounter value={item.value} animate={animate} />
              </p>
              {item.hint ? (
                <p className="ds-stats-strip__hint">{item.hint}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
