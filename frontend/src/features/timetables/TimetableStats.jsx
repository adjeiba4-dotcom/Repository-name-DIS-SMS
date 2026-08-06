import {
  BookOpen,
  CalendarClock,
  School,
  Users,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getTimetableStats } from "./timetable.mappers";

export default function TimetableStats({ entries = [], loading = false }) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = getTimetableStats(entries);

  return (
    <section
      aria-labelledby="timetable-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Schedule Metrics"
        titleId="timetable-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Scheduled Slots"
          value={String(stats.total)}
          hint="Entries in current scope"
          trend="Live"
          tone="brand"
          icon={CalendarClock}
        />
        <StatCard
          label="Classes"
          value={String(stats.classes)}
          hint="Distinct classes scheduled"
          trend="Coverage"
          tone="info"
          icon={School}
        />
        <StatCard
          label="Teachers"
          value={String(stats.teachers)}
          hint="Teachers on the timetable"
          trend="Staff"
          tone="success"
          icon={Users}
        />
        <StatCard
          label="Subjects"
          value={String(stats.subjects)}
          hint="Subjects currently scheduled"
          trend="Curriculum"
          tone="warning"
          icon={BookOpen}
        />
      </div>
    </section>
  );
}
