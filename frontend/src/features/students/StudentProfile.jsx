import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Eye,
  FileDown,
  FileText,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Printer,
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
import { toastError, toastSuccess } from "../../components/ui/Toast";
import { Body, Caption, H3 } from "../../components/ui/Typography";
import {
  getReportCardPreview,
  getReportCards,
} from "../../services/report-cards/reportCard.service";
import { getStudentById } from "../../services/students/student.service";
import ReportCardPreview from "../report-cards/ReportCardPreview";
import {
  exportReportCardA4Pdf,
  printReportCardA4,
} from "../report-cards/reportCard.export";
import {
  formatPromotion,
  formatScore,
  formatWorkflowStatus,
  getApiErrorMessage as getReportCardErrorMessage,
} from "../report-cards/reportCard.mappers";
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

const WORKFLOW_BADGE = {
  Draft: "secondary",
  Generated: "info",
  Verified: "success",
  Published: "warning",
  Locked: "secondary",
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

function ProfileSection({ title, children, className = "" }) {
  return (
    <section
      className={`space-y-[var(--space-4)] border-b border-[var(--color-border-muted)] pb-[var(--space-5)] last:border-b-0 last:pb-0 ${className}`}
    >
      <H3 size="sm">{title}</H3>
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

/**
 * Read-only student profile drawer. Loads detail from GET /students/:id
 * and recent report cards for academic snapshot access.
 */
export default function StudentProfile({
  open,
  studentId,
  onClose,
  onEdit,
}) {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!open || !studentId) {
      setStudent(null);
      setError("");
      setLoading(false);
      setPreviewOpen(false);
      setPreview(null);
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

  const reportCardsQuery = useQuery({
    queryKey: ["student-profile-report-cards", studentId],
    queryFn: async () => {
      const response = await getReportCards({
        studentId,
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      return response?.data ?? [];
    },
    enabled: Boolean(open && studentId),
  });

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
  const reportCards = reportCardsQuery.data || [];

  const openPreview = async (cardId) => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreview(null);
    try {
      const response = await getReportCardPreview(cardId);
      setPreview(response?.data ?? null);
    } catch (err) {
      setPreviewOpen(false);
      toastError(
        getReportCardErrorMessage(err, "Unable to load report card preview.")
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!preview) return;
    try {
      await exportReportCardA4Pdf(preview);
      toastSuccess("Report card PDF downloaded.");
    } catch (err) {
      toastError(
        getReportCardErrorMessage(err, "Unable to download report card PDF.")
      );
    }
  };

  const handlePrint = async () => {
    if (!preview) return;
    try {
      await printReportCardA4(preview);
    } catch (err) {
      toastError(
        getReportCardErrorMessage(err, "Unable to print report card.")
      );
    }
  };

  return (
    <>
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
                    className={
                      !photoSrc
                        ? "bg-[var(--color-brand-50)] ring-[var(--color-brand-100)]"
                        : undefined
                    }
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
                <Badge
                  variant={STATUS_BADGE[statusLabel] ?? "secondary"}
                  size="sm"
                >
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
                    student.schoolClass?.className || student.schoolClass?.name
                      ? `${student.schoolClass.className || student.schoolClass.name}${
                          student.schoolClass.classCode ||
                          student.schoolClass.code
                            ? ` (${student.schoolClass.classCode || student.schoolClass.code})`
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

              <section className="space-y-[var(--space-4)] border-b border-[var(--color-border-muted)] pb-[var(--space-5)]">
                <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
                  <H3 size="sm">Report Cards</H3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-auto"
                    onClick={() => {
                      onClose?.();
                      navigate("/report-cards");
                    }}
                  >
                    <FileText size={14} aria-hidden />
                    Open workspace
                  </Button>
                </div>

                {reportCardsQuery.isLoading ? (
                  <Caption variant="muted">Loading report cards…</Caption>
                ) : reportCardsQuery.isError ? (
                  <Alert
                    variant="error"
                    message={getReportCardErrorMessage(
                      reportCardsQuery.error,
                      "Unable to load report cards."
                    )}
                  />
                ) : reportCards.length === 0 ? (
                  <Caption variant="muted">
                    No report cards generated for this student yet. Publish
                    results, then generate from the Report Cards workspace.
                  </Caption>
                ) : (
                  <ul className="space-y-[var(--space-3)]">
                    {reportCards.map((card) => {
                      const workflowLabel = formatWorkflowStatus(
                        card.workflowStatus,
                        card
                      );
                      return (
                        <li
                          key={card.id}
                          className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface)] p-[var(--space-3)]"
                        >
                          <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-1">
                              <Body
                                size="sm"
                                className="m-0 font-[number:var(--font-weight-semibold)]"
                              >
                                {card.term?.name || "Term"} ·{" "}
                                {card.academicYear?.name || "Year"}
                              </Body>
                              <Caption variant="muted" className="m-0">
                                Avg {formatScore(card.averageScore)}
                                {card.overallGrade
                                  ? ` · Grade ${card.overallGrade}`
                                  : ""}
                                {card.classPosition
                                  ? ` · Pos. ${card.classPosition}`
                                  : ""}
                                {" · "}
                                {formatPromotion(
                                  card.promotionDecision,
                                  card.promoted
                                )}
                              </Caption>
                              <Badge
                                variant={
                                  WORKFLOW_BADGE[workflowLabel] ?? "secondary"
                                }
                                size="sm"
                              >
                                {workflowLabel}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-[var(--space-2)]">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-auto"
                                onClick={() => openPreview(card.id)}
                              >
                                <Eye size={14} aria-hidden />
                                Preview
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-auto"
                                onClick={async () => {
                                  try {
                                    const response =
                                      await getReportCardPreview(card.id);
                                    await exportReportCardA4Pdf(
                                      response?.data
                                    );
                                    toastSuccess("Report card PDF downloaded.");
                                  } catch (err) {
                                    toastError(
                                      getReportCardErrorMessage(
                                        err,
                                        "Unable to download PDF."
                                      )
                                    );
                                  }
                                }}
                              >
                                <FileDown size={14} aria-hidden />
                                PDF
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-auto"
                                onClick={async () => {
                                  try {
                                    const response =
                                      await getReportCardPreview(card.id);
                                    await printReportCardA4(response?.data);
                                  } catch (err) {
                                    toastError(
                                      getReportCardErrorMessage(
                                        err,
                                        "Unable to print."
                                      )
                                    );
                                  }
                                }}
                              >
                                <Printer size={14} aria-hidden />
                                Print
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

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

      <ReportCardPreview
        open={previewOpen}
        preview={preview}
        loading={previewLoading}
        onClose={() => {
          setPreviewOpen(false);
          setPreview(null);
        }}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
      />
    </>
  );
}
