import {
  Building2,
  FileText,
  Hash,
  Layers,
  Package,
  Users,
} from "lucide-react";

import {
  InformationCard,
  ProfileDetailItem,
  ProfileHeader,
  ProfileSection,
  TimelineCard,
} from "../../components/profile";
import { cn } from "../../utils/cn";
import {
  buildDepartmentTimeline,
  formatDepartmentStatus,
} from "./department.mappers";

/**
 * Detailed department profile body.
 */
export default function DepartmentDetails({ department, className = "" }) {
  if (!department) return null;

  const statusLabel = formatDepartmentStatus(department.status);
  const timeline = buildDepartmentTimeline(department);
  const teacherCount = Array.isArray(department.teachers)
    ? department.teachers.length
    : 0;
  const subjectCount = Array.isArray(department.subjects)
    ? department.subjects.length
    : 0;
  const employeeCount = Array.isArray(department.employees)
    ? department.employees.length
    : 0;
  const stockIssueCount = Array.isArray(department.stockIssues)
    ? department.stockIssues.length
    : 0;

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={department.name}
        subtitle={`${department.code} · Academic department`}
        status={statusLabel}
        statusLabel={statusLabel}
      />

      <ProfileSection title="Department details">
        <ProfileDetailItem
          icon={Hash}
          label="Department code"
          value={department.code || "—"}
        />
        <ProfileDetailItem
          icon={Building2}
          label="Name"
          value={department.name || "—"}
        />
        <ProfileDetailItem
          icon={Layers}
          label="Status"
          value={statusLabel}
        />
        <ProfileDetailItem
          icon={Hash}
          label="Record ID"
          value={String(department.id)}
        />
      </ProfileSection>

      {department.description ? (
        <ProfileSection title="Description">
          <ProfileDetailItem
            icon={FileText}
            label="Notes"
            value={department.description}
          />
        </ProfileSection>
      ) : null}

      <InformationCard
        title="Usage summary"
        items={[
          {
            key: "teachers",
            label: "Teachers",
            value: String(teacherCount),
            icon: Users,
          },
          {
            key: "subjects",
            label: "Subjects",
            value: String(subjectCount),
            icon: Layers,
          },
          {
            key: "employees",
            label: "Employees",
            value: String(employeeCount),
            icon: Users,
          },
          {
            key: "stock",
            label: "Stock issues",
            value: String(stockIssueCount),
            icon: Package,
          },
        ]}
      />

      <TimelineCard title="Activity" events={timeline} />
    </div>
  );
}
