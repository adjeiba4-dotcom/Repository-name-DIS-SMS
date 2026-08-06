import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Body } from "../../components/ui/Typography";

/**
 * Confirmation dialog before permanently deleting a timetable slot.
 */
export default function TimetableDeleteDialog({
  open,
  entry,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const label =
    entry?.classLabel && entry?.subjectLabel
      ? `${entry.classLabel} · ${entry.subjectLabel} (${entry.dayLabel} ${entry.timeRange})`
      : "this timetable slot";

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title="Delete timetable slot?"
      size="sm"
      disabled={loading}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            className="w-auto"
            loading={loading}
            onClick={onConfirm}
          >
            Delete Slot
          </Button>
        </>
      }
    >
      <Body variant="secondary" size="sm" className="m-0">
        You are about to permanently delete <strong>{label}</strong>. This
        frees the class, teacher, and room for rescheduling. Class subject
        allocations and teacher assignments are not affected.
      </Body>
      {error && (
        <p
          role="alert"
          className="mt-[var(--space-3)] text-[length:var(--font-size-sm)] text-[var(--color-danger-600)]"
        >
          {error}
        </p>
      )}
    </Modal>
  );
}
