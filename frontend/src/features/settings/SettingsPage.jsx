import { useState } from "react";
import {
  Award,
  Bell,
  Building2,
  History,
  SlidersHorizontal,
} from "lucide-react";

import { SectionHeader } from "../../components/dashboard";
import { cn } from "../../utils/cn";
import AuditTrailPanel from "./AuditTrailPanel";
import GlobalConfigForm from "./GlobalConfigForm";
import GradeScalePanel from "./GradeScalePanel";
import NotificationsPanel from "./NotificationsPanel";
import SchoolProfileForm from "./SchoolProfileForm";

const TABS = [
  { id: "school", label: "School Profile", icon: Building2 },
  { id: "config", label: "Platform Config", icon: SlidersHorizontal },
  { id: "grades", label: "Grading Scales", icon: Award },
  { id: "audit", label: "Audit Trail", icon: History },
  { id: "notifications", label: "Notifications", icon: Bell },
];

/**
 * Platform Settings workspace — school identity, global config,
 * grade scales, audit trail, and in-app notifications.
 */
export default function SettingsPage() {
  const [tab, setTab] = useState("school");

  return (
    <div className="space-y-[var(--space-6)]">
      <SectionHeader
        eyebrow="System"
        title="School Settings"
        description="Manage institutional identity, platform defaults, grading scales, audit history, and in-app notifications."
        titleId="settings-page-heading"
      />

      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex flex-wrap gap-[var(--space-2)] border-b border-[var(--color-border-default)] pb-[var(--space-3)]"
      >
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={cn(
                "inline-flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] transition-colors",
                active
                  ? "bg-[var(--color-ocean-blue)] text-[var(--color-text-inverse)]"
                  : "bg-[var(--color-surface-default)] text-[var(--color-text-secondary)] hover:text-[var(--color-ocean-blue)]"
              )}
              onClick={() => setTab(item.id)}
            >
              <Icon size={16} aria-hidden />
              {item.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "school" && <SchoolProfileForm />}
        {tab === "config" && <GlobalConfigForm />}
        {tab === "grades" && <GradeScalePanel />}
        {tab === "audit" && <AuditTrailPanel />}
        {tab === "notifications" && <NotificationsPanel />}
      </div>
    </div>
  );
}
