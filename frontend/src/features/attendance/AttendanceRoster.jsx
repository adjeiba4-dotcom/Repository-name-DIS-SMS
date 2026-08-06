import {
  CheckCheck,
  ClipboardCheck,
  Eraser,
  UserX,
} from "lucide-react";

import { Panel } from "../../components/dashboard";
import { ExportButtons } from "../../components/export";
import { SelectField } from "../../components/form";
import { StatusBadge } from "../../components/profile";
import Button from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import {
  ATTENDANCE_STATUS_API,
  ATTENDANCE_STATUS_MAP,
  formatAttendanceStatus,
} from "./attendance.mappers";

function RosterSkeleton() {
  return (
    <div className="space-y-[var(--space-3)]">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-[var(--radius-md)]" />
      ))}
    </div>
  );
}

export default function AttendanceRoster({
  rows = [],
  timetableSlots = [],
  loading = false,
  savingStudentId = null,
  bulkLoading = false,
  onStatusChange,
  onBulkAction,
  onView,
  onExportExcel,
  onExportPdf,
  onPrint,
  className = "",
}) {
  return (
    <Panel
      className={cn(className)}
      title="Class Take Sheet"
      description="Mark enrolled students for the selected date. Only students with an active enrollment appear here."
      actions={
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <ExportButtons
            onExportExcel={onExportExcel}
            onExportPdf={onExportPdf}
            onPrint={onPrint}
            disabled={rows.length === 0 || loading}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            loading={bulkLoading}
            disabled={loading || rows.length === 0}
            onClick={() => onBulkAction?.("MARK_PRESENT")}
          >
            <CheckCheck size={16} aria-hidden />
            Mark All Present
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            loading={bulkLoading}
            disabled={loading || rows.length === 0}
            onClick={() => onBulkAction?.("MARK_ABSENT")}
          >
            <UserX size={16} aria-hidden />
            Mark All Absent
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-auto"
            loading={bulkLoading}
            disabled={loading || rows.length === 0}
            onClick={() => onBulkAction?.("CLEAR")}
          >
            <Eraser size={16} aria-hidden />
            Clear
          </Button>
        </div>
      }
    >
      {timetableSlots.length > 0 ? (
        <div className="mb-[var(--space-4)] flex flex-wrap gap-[var(--space-2)]">
          {timetableSlots.map((slot) => (
            <Caption
              key={slot.id}
              variant="muted"
              size="sm"
              className="m-0 rounded-[var(--radius-md)] border border-[var(--color-border-muted)] px-[var(--space-2)] py-[var(--space-1)]"
            >
              {slot.startTime}–{slot.endTime}
              {slot.subject?.subjectName
                ? ` · ${slot.subject.subjectName}`
                : ""}
              {slot.teacher
                ? ` · ${[slot.teacher.firstName, slot.teacher.lastName]
                    .filter(Boolean)
                    .join(" ")}`
                : ""}
            </Caption>
          ))}
        </div>
      ) : null}

      {loading ? (
        <RosterSkeleton />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-[var(--space-2)] py-[var(--space-10)] text-center">
          <ClipboardCheck
            size={28}
            className="text-[var(--color-text-muted)]"
            aria-hidden
          />
          <Body variant="muted" size="sm" className="m-0">
            No enrolled students found for this class, year, and term.
          </Body>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border-muted)] text-left">
                <th className="px-[var(--space-3)] py-[var(--space-2)]">
                  <Caption variant="muted" size="sm" className="m-0">
                    Student
                  </Caption>
                </th>
                <th className="px-[var(--space-3)] py-[var(--space-2)]">
                  <Caption variant="muted" size="sm" className="m-0">
                    Status
                  </Caption>
                </th>
                <th className="hidden px-[var(--space-3)] py-[var(--space-2)] md:table-cell">
                  <Caption variant="muted" size="sm" className="m-0">
                    Remarks
                  </Caption>
                </th>
                <th className="px-[var(--space-3)] py-[var(--space-2)] text-right">
                  <Caption variant="muted" size="sm" className="m-0">
                    Actions
                  </Caption>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const saving = savingStudentId === row.studentId;
                return (
                  <tr
                    key={row.studentId}
                    className="border-b border-[var(--color-border-muted)] last:border-b-0"
                  >
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      <Body
                        variant="default"
                        size="sm"
                        className="m-0 font-[number:var(--font-weight-semibold)]"
                      >
                        {row.firstName} {row.lastName}
                      </Body>
                      <Caption
                        variant="muted"
                        size="sm"
                        className="m-0"
                      >
                        {row.admissionNo}
                      </Caption>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)]">
                      <div className="flex min-w-[10rem] flex-col gap-[var(--space-2)]">
                        <SelectField
                          label=""
                          name={`status-${row.studentId}`}
                          value={row.statusApi || ""}
                          onChange={(event) =>
                            onStatusChange?.(row, event.target.value)
                          }
                          options={[
                            { value: "", label: "Unmarked" },
                            ...ATTENDANCE_STATUS_API.map((value) => ({
                              value,
                              label: formatAttendanceStatus(value),
                            })),
                          ]}
                          disabled={saving || bulkLoading}
                        />
                        <StatusBadge
                          status={row.status}
                          label={row.status}
                          statusMap={ATTENDANCE_STATUS_MAP}
                        />
                      </div>
                    </td>
                    <td className="hidden px-[var(--space-3)] py-[var(--space-3)] md:table-cell">
                      <Body variant="muted" size="sm" className="m-0">
                        {row.remarks || "—"}
                      </Body>
                    </td>
                    <td className="px-[var(--space-3)] py-[var(--space-3)] text-right">
                      {row.marked ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-auto"
                          onClick={() => onView?.(row)}
                          disabled={saving}
                        >
                          View
                        </Button>
                      ) : (
                        <Caption variant="muted" size="sm" className="m-0">
                          Not marked
                        </Caption>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
