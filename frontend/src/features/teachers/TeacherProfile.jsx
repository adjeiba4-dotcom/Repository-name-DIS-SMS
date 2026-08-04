import { useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  CalendarDays,
  GraduationCap,
  IdCard,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import {
  ProfileDetailItem,
  ProfileHeader,
  ProfileSection,
} from "../../components/profile";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getTeacherById } from "../../services/teachers/teacher.service";
import {
  formatTeacherGender,
  formatTeacherStatus,
  getApiErrorMessage,
} from "./teacher.mappers";

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

/**
 * Read-only teacher profile drawer. Loads detail from GET /teachers/:id.
 * Uses shared profile layout primitives.
 */
export default function TeacherProfile({
  open,
  teacherId,
  onClose,
  onEdit,
}) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !teacherId) {
      setTeacher(null);
      setError("");
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadTeacher() {
      setLoading(true);
      setError("");
      try {
        const response = await getTeacherById(teacherId);
        if (!cancelled) {
          setTeacher(response?.data ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setTeacher(null);
          setError(
            getApiErrorMessage(err, "Unable to load teacher profile.")
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTeacher();

    return () => {
      cancelled = true;
    };
  }, [open, teacherId]);

  const fullName = teacher
    ? [teacher.firstName, teacher.lastName].filter(Boolean).join(" ")
    : "Teacher Profile";

  const statusLabel = formatTeacherStatus(teacher?.status);
  const departmentLabel = teacher?.department
    ? `${teacher.department.name}${
        teacher.department.code ? ` (${teacher.department.code})` : ""
      }`
    : "—";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Teacher Profile"
      description="Read-only overview of the selected teacher record."
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
            disabled={!teacher || loading}
            onClick={() => onEdit?.(teacher)}
          >
            Edit Teacher
          </Button>
        </>
      }
    >
      <div className="space-y-[var(--space-6)]">
        {loading && <ProfileSkeleton label="Loading teacher profile" />}

        {error && !loading && <Alert variant="error" message={error} />}

        {!loading && !error && teacher && (
          <>
            <ProfileHeader
              name={fullName}
              subtitle={teacher.staffNo}
              statusLabel={statusLabel}
              statusVariant={STATUS_BADGE[statusLabel] ?? "secondary"}
              photoSrc={teacher.photoUrl || teacher.avatarUrl || ""}
            />

            <ProfileSection title="Personal">
              <ProfileDetailItem
                icon={UserRound}
                label="Gender"
                value={formatTeacherGender(teacher.gender)}
              />
              <ProfileDetailItem
                icon={IdCard}
                label="Staff number"
                value={teacher.staffNo}
              />
              <ProfileDetailItem
                icon={Mail}
                label="Email"
                value={teacher.email}
              />
              <ProfileDetailItem
                icon={Phone}
                label="Phone"
                value={teacher.phone}
              />
            </ProfileSection>

            <ProfileSection title="Employment">
              <ProfileDetailItem
                icon={Building2}
                label="Department"
                value={departmentLabel}
              />
              <ProfileDetailItem
                icon={CalendarDays}
                label="Employment date"
                value={formatDisplayDate(teacher.employmentDate)}
              />
              <ProfileDetailItem
                icon={Briefcase}
                label="Status"
                value={statusLabel}
              />
              <ProfileDetailItem
                icon={GraduationCap}
                label="Qualification"
                value={teacher.qualification}
              />
            </ProfileSection>

            <ProfileSection title="Address">
              <div className="sm:col-span-2">
                <ProfileDetailItem
                  icon={MapPin}
                  label="Residential address"
                  value={teacher.address}
                />
              </div>
            </ProfileSection>
          </>
        )}
      </div>
    </Drawer>
  );
}
