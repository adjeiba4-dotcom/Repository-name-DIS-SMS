import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Body } from "../../components/ui/Typography";

/**
 * Confirmation dialog before archiving (soft-deleting) a student.
 */
export default function StudentDeleteDialog({
  open,
  student,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const name = student?.name || "this student";

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title="Archive student?"
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
            Archive Student
          </Button>
        </>
      }
    >
      <Body variant="secondary" size="sm" className="m-0">
        You are about to archive <strong>{name}</strong>
        {student?.studentId ? ` (${student.studentId})` : ""}. The record will
        be soft-deleted and can be restored later from archived students.
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
