import { CalendarRange, Layers, BookMarked, TrendingUp } from "lucide-react";

import { SectionHeader, StatsStrip } from "../../../components/dashboard";
import { ACADEMIC_SUMMARY } from "../data/placeholders";

const ICONS = {
  year: CalendarRange,
  term: BookMarked,
  departments: Layers,
  completion: TrendingUp,
};

export default function AcademicSummary({ items = ACADEMIC_SUMMARY }) {
  const stripItems = items.map((item) => ({
    id: item.id,
    label: item.label,
    value: item.value,
    hint: item.detail,
    tone: item.tone,
    icon: ICONS[item.id] ?? Layers,
  }));

  return (
    <section
      aria-labelledby="dashboard-academic-heading"
      className="space-y-[var(--space-4)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Academic Summary"
        description="Current year posture, term status, and curriculum coverage."
        titleId="dashboard-academic-heading"
      />

      <StatsStrip items={stripItems} />
    </section>
  );
}
