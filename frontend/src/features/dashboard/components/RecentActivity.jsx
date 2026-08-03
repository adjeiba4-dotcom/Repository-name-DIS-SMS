import { DashboardPanel } from "../../../components/dashboard";
import Badge from "../../../components/ui/Badge";
import { Body, Caption } from "../../../components/ui/Typography";
import { RECENT_ACTIVITY } from "../data/placeholders";

export default function RecentActivity({ items = RECENT_ACTIVITY }) {
  return (
    <DashboardPanel
      title="Recent Activity"
      description="Latest system and module events."
      className="h-full"
    >
      <ul className="divide-y divide-[var(--color-border-muted)]">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-[var(--space-3)] py-[var(--space-3)] first:pt-0 last:pb-0"
          >
            <div className="min-w-0 space-y-[var(--space-1)]">
              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                <Body
                  variant="default"
                  size="sm"
                  className="m-0 font-[number:var(--font-weight-semibold)]"
                >
                  {item.title}
                </Body>
                <Badge variant={item.tone ?? "secondary"} size="sm">
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
