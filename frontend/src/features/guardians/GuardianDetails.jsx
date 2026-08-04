import {
  Briefcase,
  Building2,
  CalendarDays,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  InformationCard,
  ProfileDetailItem,
  ProfileHeader,
  ProfileSection,
  StatusBadge,
  TimelineCard,
} from "../../components/profile";
import Button from "../../components/ui/Button";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import {
  formatDisplayDate,
  formatGuardianGender,
  formatGuardianStatus,
  formatRelationship,
  getGuardianFullName,
  buildGuardianTimeline,
} from "./guardian.mappers";

/**
 * Detailed guardian profile body: identity, info cards, linked students, timeline.
 */
export default function GuardianDetails({
  guardian,
  onLinkStudent,
  onUnlinkStudent,
  unlinkLoadingId = null,
  className = "",
}) {
  if (!guardian) return null;

  const fullName = getGuardianFullName(guardian);
  const statusLabel = formatGuardianStatus(guardian.status);
  const links = guardian.studentGuardians || [];
  const timeline = buildGuardianTimeline(guardian);

  return (
    <div className={cn("space-y-[var(--space-6)]", className)}>
      <ProfileHeader
        name={fullName}
        subtitle={guardian.guardianNumber || "Guardian"}
        status={statusLabel}
        statusLabel={statusLabel}
        photoSrc={guardian.photo || ""}
      />

      <ProfileSection title="Personal">
        <ProfileDetailItem
          icon={UserRound}
          label="Gender"
          value={formatGuardianGender(guardian.gender)}
        />
        <ProfileDetailItem
          icon={CalendarDays}
          label="Date of birth"
          value={formatDisplayDate(guardian.dateOfBirth)}
        />
        <ProfileDetailItem
          icon={IdCard}
          label="National ID"
          value={guardian.nationalId}
        />
        <ProfileDetailItem
          icon={IdCard}
          label="Guardian number"
          value={guardian.guardianNumber}
        />
      </ProfileSection>

      <InformationCard
        title="Contact & employment"
        items={[
          { key: "phone", label: "Phone", value: guardian.phone, icon: Phone },
          {
            key: "alternatePhone",
            label: "Alternate phone",
            value: guardian.alternatePhone,
            icon: Phone,
          },
          { key: "email", label: "Email", value: guardian.email, icon: Mail },
          {
            key: "occupation",
            label: "Occupation",
            value: guardian.occupation,
            icon: Briefcase,
          },
          {
            key: "employer",
            label: "Employer",
            value: guardian.employer,
            icon: Building2,
          },
          {
            key: "residentialAddress",
            label: "Residential address",
            value: guardian.residentialAddress,
            icon: MapPin,
          },
          {
            key: "digitalAddress",
            label: "Digital address",
            value: guardian.digitalAddress,
            icon: MapPin,
          },
        ]}
      />

      {guardian.notes ? (
        <InformationCard
          title="Notes"
          items={[{ key: "notes", label: "Internal notes", value: guardian.notes }]}
          columns={1}
        />
      ) : null}

      <section className="space-y-[var(--space-4)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div>
            <Body
              variant="default"
              size="sm"
              className="m-0 font-[number:var(--font-weight-semibold)]"
            >
              Linked students
            </Body>
            <Caption variant="muted" size="sm" className="m-0">
              Relationships, primary contact, and emergency flags.
            </Caption>
          </div>
          {onLinkStudent ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-auto"
              onClick={onLinkStudent}
            >
              <Plus size={16} aria-hidden />
              Add Student
            </Button>
          ) : null}
        </div>

        {links.length === 0 ? (
          <Caption variant="muted" size="sm" className="m-0">
            No students linked yet.
          </Caption>
        ) : (
          <ul className="space-y-[var(--space-3)]">
            {links.map((link) => {
              const studentName = link.student
                ? [link.student.firstName, link.student.lastName]
                    .filter(Boolean)
                    .join(" ")
                : `Student #${link.studentId}`;
              const loading =
                unlinkLoadingId != null &&
                String(unlinkLoadingId) === String(link.studentId);

              return (
                <li
                  key={link.id || `${link.studentId}-${link.guardianId}`}
                  className="rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface-default)] p-[var(--space-4)]"
                >
                  <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-[var(--space-2)]">
                      <div>
                        <Body
                          variant="default"
                          size="sm"
                          className="m-0 font-[number:var(--font-weight-semibold)]"
                        >
                          {studentName}
                        </Body>
                        <Caption variant="muted" size="sm" className="m-0">
                          {link.student?.admissionNo ||
                            `ID ${link.studentId}`}
                        </Caption>
                      </div>
                      <div className="flex flex-wrap gap-[var(--space-2)]">
                        <StatusBadge
                          status={link.relationship}
                          label={formatRelationship(link.relationship)}
                          variant="info"
                        />
                        {link.isPrimary ? (
                          <StatusBadge
                            status="PRIMARY"
                            label="Primary Guardian"
                            variant="success"
                          />
                        ) : null}
                        {link.emergencyContact ? (
                          <StatusBadge
                            status="EMERGENCY"
                            label="Emergency Contact"
                            variant="warning"
                          />
                        ) : null}
                        {link.financialResponsibility ? (
                          <StatusBadge
                            status="FINANCIAL"
                            label="Financial Responsibility"
                            variant="primary"
                          />
                        ) : null}
                        {link.canPickup ? (
                          <StatusBadge
                            status="PICKUP"
                            label="Can Pickup"
                            variant="secondary"
                          />
                        ) : null}
                      </div>
                      {link.remarks ? (
                        <Caption variant="muted" size="sm" className="m-0">
                          {link.remarks}
                        </Caption>
                      ) : null}
                    </div>

                    {onUnlinkStudent ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-auto text-[var(--color-danger-700)]"
                        loading={loading}
                        onClick={() =>
                          onUnlinkStudent(link.studentId, studentName)
                        }
                      >
                        <Trash2 size={16} aria-hidden />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <TimelineCard
        title="Audit timeline"
        description="Registration, updates, archive events, and student links."
        events={timeline}
      />
    </div>
  );
}
