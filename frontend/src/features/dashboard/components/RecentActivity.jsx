import { DashboardPanel } from "../../../components/dashboard";
import Badge from "../../../components/ui/Badge";
import { Body, Caption } from "../../../components/ui/Typography";
import { cn } from "../../../utils/cn";
import { RECENT_ACTIVITY } from "../data/placeholders";

const DOT_CLASS = {
  ocean: "bg-[var(--color-ocean-blue)]",
  cyan: "bg-[var(--color-accent-cyan)]",
  lime: "bg-[var(--color-accent-lime)]",
  yellow: "bg-[var(--color-accent-yellow)]",
  red: "bg-[var(--color-accent-red)]",
  info: "bg-[var(--color-ocean-blue)]",
  secondary: "bg-[var(--color-border-strong)]",
};

export default function RecentActivity({ items = RECENT_ACTIVITY }) {
  return (
    <DashboardPanel
      title="Recent Activities"
      description="Latest operational events across modules."
      className="h-full"
    >
      <ul className="divide-y divide-[var(--color-border-muted)]">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-[var(--space-3)] py-[var(--space-3)] first:pt-0 last:pb-0"
          >
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0",
                DOT_CLASS[item.tone] ?? DOT_CLASS.ocean
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-[var(--space-1)]">
              <div className="flex flex-wrap items-center justify-between gap-[var(--space-2)]">
                <Body
                  variant="default"
                  size="sm"
                  className="m-0 font-[number:var(--font-weight-semibold)]"
                >
                  {item.title}
                </Body>
                <Badge variant="secondary" size="sm" rounded={false}>
                  {item.time}
                </Badge>
              </div>
              <Caption variant="muted" size="sm" className="m-0">
                {item.detail}
              </Caption>
            </div>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  );
}
