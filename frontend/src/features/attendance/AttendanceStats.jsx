import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  UserX,
  Users,
} from "lucide-react";

import { SectionHeader, StatCard } from "../../components/dashboard";
import { StatCardsSkeleton } from "../../components/ui/Skeleton";
import { getRosterStats } from "./attendance.mappers";

export default function AttendanceStats({
  summary = {},
  timetableSlots = [],
  overview = null,
  loading = false,
}) {
  if (loading) {
    return <StatCardsSkeleton count={4} />;
  }

  const stats = overview
    ? {
        enrolled: overview.total ?? 0,
        present: overview.PRESENT ?? 0,
        absent: overview.ABSENT ?? 0,
        late: overview.LATE ?? 0,
        excused: overview.EXCUSED ?? 0,
        unmarked: 0,
        presentRate: overview.presentRate ?? 0,
        periods: timetableSlots.length,
      }
    : getRosterStats(summary, timetableSlots);

  return (
    <section
      aria-labelledby="attendance-stats-heading"
      className="space-y-[var(--space-3)]"
    >
      <SectionHeader
        eyebrow="Academics"
        title="Attendance Metrics"
        titleId="attendance-stats-heading"
      />
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Present Rate"
          value={`${stats.presentRate}%`}
          hint={
            overview
              ? "Marked records in current scope"
              : `${stats.enrolled} enrolled students`
          }
          trend="Live"
          tone="brand"
          icon={ClipboardCheck}
        />
        <StatCard
          label="Present"
          value={String(stats.present)}
          hint={
            stats.periods
              ? `${stats.periods} timetable period(s) today`
              : "Marked present"
          }
          trend="On track"
          tone="success"
          icon={CheckCircle2}
        />
        <StatCard
          label="Absent / Late"
          value={String(stats.absent + stats.late)}
          hint={`${stats.absent} absent · ${stats.late} late`}
          trend="Watch"
          tone="warning"
          icon={Clock3}
        />
        <StatCard
          label={overview ? "Excused" : "Unmarked"}
          value={String(overview ? stats.excused : stats.unmarked)}
          hint={
            overview
              ? "Excused absences"
              : "Still waiting to be marked"
          }
          trend={overview ? "Notes" : "Action"}
          tone="info"
          icon={overview ? UserX : Users}
        />
      </div>
    </section>
  );
}
