import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import { DashboardPanel } from "../../../components/dashboard";
import { Body, Caption } from "../../../components/ui/Typography";
import { cn } from "../../../utils/cn";
import { QUICK_ACTIONS } from "../data/placeholders";

const TONE_CLASS = {
  ocean: "ds-kpi-icon--ocean",
  cyan: "ds-kpi-icon--cyan",
  lime: "ds-kpi-icon--lime",
  yellow: "ds-kpi-icon--yellow",
  red: "ds-kpi-icon--red",
};

export default function QuickActions({ actions = QUICK_ACTIONS }) {
  return (
    <DashboardPanel
      title="Quick Actions"
      description="Jump into common workflows."
      className="h-full"
    >
      <ul className="space-y-[var(--space-2)]">
        {actions.map((action) => (
          <li key={action.id}>
            <Link
              to={action.path}
              className={cn(
                "group flex w-full items-center justify-between gap-[var(--space-3)]",
                "border border-transparent bg-[var(--color-surface-muted)]",
                "px-[var(--space-3)] py-[var(--space-3)]",
                "text-left transition-[background-color,border-color,box-shadow] duration-[var(--transition-normal)]",
                "hover:border-[var(--color-border-default)] hover:bg-[var(--color-surface-default)] hover:shadow-[var(--shadow-sm)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2"
              )}
            >
              <span className="flex min-w-0 items-start gap-[var(--space-3)]">
                <span
                  className={cn(
                    "ds-kpi-icon mt-0.5",
                    TONE_CLASS[action.tone] ?? TONE_CLASS.ocean
                  )}
                  aria-hidden
                >
                  <ArrowUpRight size={14} />
                </span>
                <span className="min-w-0">
                  <Body
                    variant="default"
                    size="sm"
                    className="m-0 font-[number:var(--font-weight-semibold)]"
                  >
                    {action.label}
                  </Body>
                  <Caption
                    variant="muted"
                    size="sm"
                    className="m-0 mt-[var(--space-1)]"
                  >
                    {action.description}
                  </Caption>
                </span>
              </span>
              <ArrowUpRight
                size={16}
                className="shrink-0 text-[var(--color-text-muted)] transition-colors duration-[var(--transition-fast)] group-hover:text-[var(--color-ocean-blue)]"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  );
}
