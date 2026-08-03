import {
  GraduationCap,
  ClipboardCheck,
  Wallet,
  Users,
} from "lucide-react";

import {
  SectionHeader,
  StatCard,
} from "../../../components/dashboard";
import { KPI_PLACEHOLDERS } from "../data/placeholders";

const ICONS = {
  students: GraduationCap,
  attendance: ClipboardCheck,
  fees: Wallet,
  staff: Users,
};

export default function KpiGrid({ items = KPI_PLACEHOLDERS }) {
  return (
    <section aria-labelledby="dashboard-kpi-heading" className="space-y-[var(--space-3)]">
      <SectionHeader
        eyebrow="Overview"
        title="Key Metrics"
        titleId="dashboard-kpi-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <StatCard
            key={item.id}
            label={item.label}
            value={item.value}
            hint={item.hint}
            trend={item.trend}
            tone={item.tone}
            icon={ICONS[item.id] ?? GraduationCap}
          />
        ))}
      </div>
    </section>
  );
}
