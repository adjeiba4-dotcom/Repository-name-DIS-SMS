import { DashboardPanel } from "../../../components/dashboard";
import Badge from "../../../components/ui/Badge";
import { Body, Caption } from "../../../components/ui/Typography";
import { ANNOUNCEMENTS } from "../data/placeholders";

export default function Announcements({ items = ANNOUNCEMENTS }) {
  return (
    <DashboardPanel
      title="Announcements"
      description="Notices for administrators and staff."
      className="h-full"
    >
      <ul className="space-y-[var(--space-3)]">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-[var(--space-3)]"
          >
            <div className="mb-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-2)]">
              <Body
                variant="default"
                size="sm"
                className="m-0 font-[number:var(--font-weight-semibold)]"
              >
                {item.title}
              </Body>
              <Badge variant={item.tone ?? "primary"} size="sm">
                {item.tag}
              </Badge>
            </div>
            <Caption variant="secondary" size="sm" className="m-0">
              {item.body}
            </Caption>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  );
}
