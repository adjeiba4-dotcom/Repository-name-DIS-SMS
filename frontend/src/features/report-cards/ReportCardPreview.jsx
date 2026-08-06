import { FileDown, Printer } from "lucide-react";

import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { Skeleton } from "../../components/ui/Skeleton";
import { Body, Caption } from "../../components/ui/Typography";

/**
 * On-screen A4-style preview using the template render model.
 */
export default function ReportCardPreview({
  open,
  preview = null,
  loading = false,
  onClose,
  onDownloadPdf,
  onPrint,
}) {
  const header = preview?.header || {};
  const student = preview?.student || {};
  const summary = preview?.summary || {};
  const attendance = preview?.attendance || {};
  const remarks = preview?.remarks || {};
  const promotion = preview?.promotion || {};
  const subjects = preview?.subjects || [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Report Card Preview"
      description="Official A4 layout — school branding, subjects, attendance, remarks, and signatures."
      size="xl"
      footer={
        <div className="flex flex-wrap justify-end gap-[var(--space-2)]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onPrint}
            disabled={!preview || loading}
          >
            <Printer size={16} aria-hidden />
            Print
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onDownloadPdf}
            disabled={!preview || loading}
          >
            <FileDown size={16} aria-hidden />
            Download PDF
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !preview ? (
        <Body variant="muted">No preview available.</Body>
      ) : (
        <article
          className="mx-auto max-w-[210mm] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-[var(--space-6)] text-[var(--color-text)] shadow-[var(--shadow-sm)]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <header className="flex items-start justify-between gap-4 border-b-2 border-[var(--color-ocean-blue)] pb-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              {header.logoUrl ? (
                <img
                  src={header.logoUrl}
                  alt="School logo"
                  className="h-full w-full object-contain"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 text-center">
              <h2 className="m-0 text-[length:var(--font-size-xl)] font-[number:var(--font-weight-bold)] text-[var(--color-ocean-blue)]">
                {header.schoolName}
              </h2>
              {header.motto ? (
                <Caption variant="muted" className="m-0 italic">
                  {header.motto}
                </Caption>
              ) : null}
              <Caption variant="muted" className="m-0">
                {header.address}
              </Caption>
              <Caption variant="muted" className="m-0">
                {[header.phone, header.email].filter(Boolean).join(" · ")}
              </Caption>
            </div>
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt="Student"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-[var(--color-text-muted)]">
                  PHOTO
                </div>
              )}
            </div>
          </header>

          <h3 className="mt-4 mb-1 text-center text-[length:var(--font-size-base)] font-[number:var(--font-weight-bold)] tracking-wide text-[var(--color-ocean-blue)]">
            {header.title || "STUDENT REPORT CARD"}
          </h3>
          <Caption variant="muted" className="mb-4 block text-center">
            {header.academicYear} · {header.term}
          </Caption>

          <div className="mb-4 grid grid-cols-1 gap-2 text-[length:var(--font-size-sm)] sm:grid-cols-2">
            <div>
              <strong>Student:</strong> {student.fullName}
            </div>
            <div>
              <strong>Admission No:</strong> {student.admissionNo}
            </div>
            <div>
              <strong>Class:</strong> {student.className}
              {student.classCode ? ` (${student.classCode})` : ""}
            </div>
            <div>
              <strong>Gender:</strong> {student.gender || "—"}
            </div>
            <div>
              <strong>Class Teacher:</strong>{" "}
              {student.classTeacherName || "—"}
            </div>
            <div>
              <strong>Date of Birth:</strong> {student.dateOfBirth || "—"}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[length:var(--font-size-xs)]">
              <thead>
                <tr className="bg-[var(--color-ocean-blue)] text-white">
                  <th className="border border-[var(--color-border)] px-2 py-1 text-left">
                    #
                  </th>
                  <th className="border border-[var(--color-border)] px-2 py-1 text-left">
                    Subject
                  </th>
                  <th className="border border-[var(--color-border)] px-2 py-1">
                    CA
                  </th>
                  <th className="border border-[var(--color-border)] px-2 py-1">
                    Exam
                  </th>
                  <th className="border border-[var(--color-border)] px-2 py-1">
                    Final
                  </th>
                  <th className="border border-[var(--color-border)] px-2 py-1">
                    Grade
                  </th>
                  <th className="border border-[var(--color-border)] px-2 py-1">
                    Pos.
                  </th>
                  <th className="border border-[var(--color-border)] px-2 py-1 text-left">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((row) => (
                  <tr
                    key={`${row.subjectCode}-${row.index}`}
                    className="even:bg-[var(--color-ocean-blue-soft)]"
                  >
                    <td className="border border-[var(--color-border)] px-2 py-1">
                      {row.index}
                    </td>
                    <td className="border border-[var(--color-border)] px-2 py-1">
                      {row.subjectName}
                    </td>
                    <td className="border border-[var(--color-border)] px-2 py-1 text-center">
                      {row.caScore ?? "—"}
                    </td>
                    <td className="border border-[var(--color-border)] px-2 py-1 text-center">
                      {row.examScore ?? "—"}
                    </td>
                    <td className="border border-[var(--color-border)] px-2 py-1 text-center font-[number:var(--font-weight-semibold)]">
                      {row.finalScore ?? "—"}
                    </td>
                    <td className="border border-[var(--color-border)] px-2 py-1 text-center">
                      {row.grade ?? "—"}
                    </td>
                    <td className="border border-[var(--color-border)] px-2 py-1 text-center">
                      {row.subjectPosition ?? "—"}
                    </td>
                    <td className="border border-[var(--color-border)] px-2 py-1">
                      {row.remarks || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="mt-4 space-y-3 text-[length:var(--font-size-sm)]">
            <div>
              <h4 className="m-0 text-[var(--color-ocean-blue)]">
                Academic Summary
              </h4>
              <p className="m-0 mt-1">
                Subjects: {summary.subjectCount ?? "—"} · Average:{" "}
                {summary.averageScore ?? "—"} · Overall Grade:{" "}
                {summary.overallGrade ?? "—"} · Class Position:{" "}
                {summary.classPosition ?? "—"} · Passed:{" "}
                {summary.passedCount ?? 0} · Failed: {summary.failedCount ?? 0}
              </p>
            </div>
            <div>
              <h4 className="m-0 text-[var(--color-ocean-blue)]">
                Attendance Summary
              </h4>
              <p className="m-0 mt-1">
                Present: {attendance.daysPresent ?? 0} · Absent:{" "}
                {attendance.daysAbsent ?? 0} · Late: {attendance.daysLate ?? 0}{" "}
                · Excused: {attendance.daysExcused ?? 0} · Rate:{" "}
                {attendance.attendancePercentage != null
                  ? `${attendance.attendancePercentage}%`
                  : "—"}
              </p>
            </div>
            <div>
              <h4 className="m-0 text-[var(--color-ocean-blue)]">Remarks</h4>
              <p className="m-0 mt-1">
                <strong>Class Teacher:</strong> {remarks.teacher || "—"}
              </p>
              <p className="m-0 mt-1">
                <strong>Headmaster:</strong> {remarks.headmaster || "—"}
              </p>
              <p className="m-0 mt-2">
                <strong>Promotion Decision:</strong>{" "}
                {promotion.label || "Pending"}
              </p>
            </div>
          </section>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              preview.signatures?.classTeacher,
              preview.signatures?.headmaster,
              preview.signatures?.parentGuardian,
            ].map((sig, index) => (
              <div
                key={sig?.label || index}
                className="border-t border-[var(--color-border-strong)] pt-2 text-[length:var(--font-size-xs)]"
              >
                <div className="min-h-[1.25rem] font-[number:var(--font-weight-semibold)]">
                  {sig?.name || "\u00A0"}
                </div>
                <div className="mt-1 text-[var(--color-text-muted)]">
                  {sig?.label || "Signature"}
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-6 border-t border-[var(--color-ocean-blue)] pt-3 text-center text-[10px] text-[var(--color-text-muted)]">
            {preview.footer?.confidentiality}
            <br />
            {preview.footer?.brand || "DIS-SMS"}
          </footer>
        </article>
      )}
    </Drawer>
  );
}
