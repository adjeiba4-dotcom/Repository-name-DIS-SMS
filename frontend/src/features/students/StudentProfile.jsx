import { useEffect, useState } from "react";
import {
  CalendarDays,
  IdCard,
  Mail,
  MapPin,
  Phone,
  School,
  UserRound,
  Users,
} from "lucide-react";

import Alert from "../../components/ui/Alert";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { StudentProfileSkeleton } from "../../components/ui/Skeleton";
import { Body, Caption, H3 } from "../../components/ui/Typography";
import { getStudentById } from "../../services/students/student.service";
import {
  formatStudentGender,
  formatStudentStatus,
  formatRelationship,
  getApiErrorMessage,
  getPrimaryGuardianLink,
} from "./student.mappers";

const STATUS_BADGE = {
  Active: "success",
  Inactive: "warning",
  Archived: "secondary",
};

function formatDisplayDate(value) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return String(value).slice(0, 10);
  }
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-[var(--space-3)]">
      <div
        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]"
        aria-hidden
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <Caption variant="muted" size="sm" className="m-0">
          {label}
        </Caption>
        <Body
          variant="default"
          size="sm"
          className="m-0 break-words font-[number:var(--font-weight-semibold)]"
        >
          {value || "—"}
        </Body>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }) {
  return (
    <section className="space-y-[var(--space-4)] border-b border-[var(--color-border-muted)] pb-[var(--space-5)] last:border-b-0 last:pb-0">
      <H3 size="sm">{title}</H3>
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

/**
 * Read-only student profile drawer. Loads detail from GET /students/:id.
 */
export default function StudentProfile({
  open,
  studentId,
  onClose,
  onEdit,
}) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !studentId) {
      setStudent(null);
      setError("");
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadStudent() {
      setLoading(true);
      setError("");
      try {
        const response = await getStudentById(studentId);
        if (!cancelled) {
          setStudent(response?.data ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setStudent(null);
          setError(
            getApiErrorMessage(err, "Unable to load student profile.")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStudent();

    return () => {
      cancelled = true;
    };
  }, [open, studentId]);

  const fullName = student
    ? [student.firstName, student.otherName, student.lastName]
        .filter(Boolean)
        .join(" ")
    : "Student Profile";

  const statusLabel = formatStudentStatus(student?.status);
  const primaryLink = getPrimaryGuardianLink(student);
  const primaryGuardian = primaryLink?.guardian;
  const guardianName = primaryGuardian
    ? [primaryGuardian.firstName, primaryGuardian.lastName]
        .filter(Boolean)
        .join(" ")
    : "";
  const photoSrc = student?.photoUrl || student?.avatarUrl || "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Student Profile"
      description="Read-only overview of the selected student record."
      size="lg"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-auto"
            disabled={!student || loading}
            onClick={() => onEdit?.(student)}
          >
            Edit Student
          </Button>
        </>
      }
    >
      <div className="space-y-[var(--space-6)]">
        {loading && <StudentProfileSkeleton />}

        {error && !loading && (
          <Alert variant="error" message={error} />
        )}

        {!loading && !error && student && (
          <>
            <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] p-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-[var(--space-3)]">
                <Avatar
                  name={fullName}
                  src={photoSrc || undefined}
                  size="lg"
                  className={!photoSrc ? "bg-[var(--color-brand-50)] ring-[var(--color-brand-100)]" : undefined}
                />
                <div className="min-w-0">
                  <H3 size="sm" className="truncate">
                    {fullName}
                  </H3>
                  <Caption variant="muted" size="sm" className="m-0 truncate">
                    {student.admissionNo}
                  </Caption>
                </div>
              </div>
              <Badge variant={STATUS_BADGE[statusLabel] ?? "secondary"} size="sm">
                {statusLabel}
              </Badge>
            </div>

            <ProfileSection title="Personal">
              <DetailItem
                icon={UserRound}
                label="Gender"
                value={formatStudentGender(student.gender)}
              />
              <DetailItem
                icon={CalendarDays}
                label="Date of birth"
                value={formatDisplayDate(student.dateOfBirth)}
              />
              <DetailItem icon={Mail} label="Email" value={student.email} />
              <DetailItem icon={Phone} label="Phone" value={student.phone} />
            </ProfileSection>

            <ProfileSection title="Academic">
              <DetailItem
                icon={IdCard}
                label="Admission number"
                value={student.admissionNo}
              />
              <DetailItem
                icon={School}
                label="Class"
                value={
                  student.schoolClass?.name
                    ? `${student.schoolClass.name}${
                        student.schoolClass.code
                          ? ` (${student.schoolClass.code})`
                          : ""
                      }`
                    : "—"
                }
              />
              <DetailItem
                icon={CalendarDays}
                label="Admission date"
                value={formatDisplayDate(student.admissionDate)}
              />
              <DetailItem
                icon={IdCard}
                label="Status"
                value={statusLabel}
              />
            </ProfileSection>

            <ProfileSection title="Guardian">
              <DetailItem icon={Users} label="Name" value={guardianName} />
              <DetailItem
                icon={Users}
                label="Relationship"
                value={formatRelationship(primaryLink?.relationship)}
              />
              <DetailItem
                icon={Phone}
                label="Phone"
                value={primaryGuardian?.phone}
              />
              <DetailItem
                icon={Mail}
                label="Email"
                value={primaryGuardian?.email}
              />
            </ProfileSection>

            <ProfileSection title="Address">
              <div className="sm:col-span-2">
                <DetailItem
                  icon={MapPin}
                  label="Residential address"
                  value={student.address}
                />
              </div>
            </ProfileSection>
          </>
        )}
      </div>
    </Drawer>
  );
}
