import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Body } from "../../components/ui/Typography";

/**
 * Confirmation dialog before archiving (soft-deleting) an allocation.
 */
export default function ClassSubjectDeleteDialog({
  open,
  allocation,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const label =
    allocation?.className && allocation?.subjectName
      ? `${allocation.className} → ${allocation.subjectName}`
      : "this allocation";

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title="Archive allocation?"
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
            Archive Allocation
          </Button>
        </>
      }
    >
      <Body variant="secondary" size="sm" className="m-0">
        You are about to archive <strong>{label}</strong>. Archiving is blocked
        when the allocation is referenced by timetable, examinations, or
        results. Soft-deleted allocations can be restored later.
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
