import { CalendarClock, Eye, Pencil, Plus, Trash2 } from "lucide-react";

import { EmptyState, Panel } from "../../components/dashboard";
import { ExportButtons } from "../../components/export";
import Button from "../../components/ui/Button";
import { Body, Caption, H3 } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import {
  DAY_LABELS,
  WEEKDAY_COLUMNS,
  buildWeekGrid,
} from "./timetable.mappers";

function SlotCard({ slot, onView, onEdit, onDelete }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-muted)] bg-[var(--color-surface)] p-[var(--space-2)]">
      <Body
        variant="default"
        size="sm"
        className="m-0 font-[number:var(--font-weight-semibold)]"
      >
        {slot.subjectName || "Subject"}
      </Body>
      <Caption variant="muted" size="sm" className="m-0 block truncate">
        {slot.className || "Class"}
      </Caption>
      <Caption variant="muted" size="sm" className="m-0 block truncate">
        {slot.teacherName || "Teacher"}
      </Caption>
      {slot.room ? (
        <Caption variant="muted" size="sm" className="m-0 block truncate">
          {slot.room}
        </Caption>
      ) : null}
      <div className="mt-[var(--space-2)] flex flex-wrap gap-[var(--space-1)]">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-auto px-[var(--space-2)]"
          aria-label={`View ${slot.subjectLabel}`}
          onClick={() => onView?.(slot)}
        >
          <Eye size={14} aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-auto px-[var(--space-2)]"
          aria-label={`Edit ${slot.subjectLabel}`}
          onClick={() => onEdit?.(slot)}
        >
          <Pencil size={14} aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-auto px-[var(--space-2)] text-[var(--color-danger-600)]"
          aria-label={`Delete ${slot.subjectLabel}`}
          onClick={() => onDelete?.(slot)}
        >
          <Trash2 size={14} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/**
 * Week grid view — days as columns, time bands as rows.
 */
export default function TimetableGrid({
  entries = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onExportExcel,
  onExportPdf,
  onPrint,
  className = "",
}) {
  const rows = buildWeekGrid(entries, WEEKDAY_COLUMNS);

  return (
    <Panel
      className={cn(className)}
      title="Week Grid"
      description="Monday–Friday schedule for the selected academic year and term."
      actions={
        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
          <ExportButtons
            onExportExcel={onExportExcel}
            onExportPdf={onExportPdf}
            onPrint={onPrint}
            disabled={entries.length === 0}
          />
          {onAdd ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={onAdd}
              disabled={loading}
            >
              <Plus size={16} aria-hidden />
              Add Slot
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <Body variant="muted" size="sm" className="m-0">
          Loading timetable grid…
        </Body>
      ) : null}

      {!loading && rows.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No periods scheduled"
          description="Add a timetable slot to populate the week grid."
          actionLabel={onAdd ? "Add Slot" : undefined}
          onAction={onAdd}
        />
      ) : null}

      {!loading && rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className="border-b border-[var(--color-border-muted)] px-[var(--space-3)] py-[var(--space-2)] text-left">
                  <Caption
                    variant="muted"
                    size="sm"
                    className="m-0 uppercase tracking-wide"
                  >
                    Time
                  </Caption>
                </th>
                {WEEKDAY_COLUMNS.map((day) => (
                  <th
                    key={day}
                    className="border-b border-[var(--color-border-muted)] px-[var(--space-3)] py-[var(--space-2)] text-left"
                  >
                    <H3 size="sm" className="m-0">
                      {DAY_LABELS[day]}
                    </H3>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="align-top border-b border-[var(--color-border-muted)] px-[var(--space-3)] py-[var(--space-3)] whitespace-nowrap">
                    <Body
                      variant="default"
                      size="sm"
                      className="m-0 font-[number:var(--font-weight-semibold)]"
                    >
                      {row.timeLabel}
                    </Body>
                  </td>
                  {WEEKDAY_COLUMNS.map((day) => (
                    <td
                      key={`${row.key}-${day}`}
                      className="align-top border-b border-[var(--color-border-muted)] px-[var(--space-2)] py-[var(--space-2)]"
                    >
                      <div className="flex flex-col gap-[var(--space-2)]">
                        {(row.cells[day] || []).map((slot) => (
                          <SlotCard
                            key={slot.id}
                            slot={slot}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                          />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Panel>
  );
}
