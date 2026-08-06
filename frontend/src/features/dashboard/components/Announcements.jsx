import { DashboardPanel } from "../../../components/dashboard";
import Badge from "../../../components/ui/Badge";
import { Body, Caption } from "../../../components/ui/Typography";
import { cn } from "../../../utils/cn";
import { ANNOUNCEMENTS } from "../data/placeholders";

const TAG_VARIANT = {
  ocean: "primary",
  yellow: "warning",
  cyan: "info",
  lime: "success",
  red: "danger",
  primary: "primary",
  info: "info",
};

const BAR_CLASS = {
  ocean: "bg-[var(--color-ocean-blue)]",
  yellow: "bg-[var(--color-accent-yellow)]",
  cyan: "bg-[var(--color-accent-cyan)]",
  lime: "bg-[var(--color-accent-lime)]",
  red: "bg-[var(--color-accent-red)]",
};

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
            className="relative border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-[var(--space-3)] pl-[var(--space-4)]"
          >
            <span
              className={cn(
                "absolute bottom-0 left-0 top-0 w-1",
                BAR_CLASS[item.tone] ?? BAR_CLASS.ocean
              )}
              aria-hidden
            />
            <div className="mb-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-2)]">
              <Body
                variant="default"
                size="sm"
                className="m-0 font-[number:var(--font-weight-semibold)]"
              >
                {item.title}
              </Body>
              <Badge
                variant={TAG_VARIANT[item.tone] ?? "primary"}
                size="sm"
                rounded={false}
              >
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
