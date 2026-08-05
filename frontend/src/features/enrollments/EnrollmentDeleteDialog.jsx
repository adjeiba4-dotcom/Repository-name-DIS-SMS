import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Body } from "../../components/ui/Typography";

/**
 * Confirmation dialog before archiving (soft-deleting) an enrollment.
 */
export default function EnrollmentDeleteDialog({
  open,
  enrollment,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const label =
    enrollment?.studentName && enrollment?.className
      ? `${enrollment.studentName} → ${enrollment.className}`
      : enrollment?.enrollmentNumber || "this enrollment";

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title="Archive enrollment?"
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
            Archive Enrollment
          </Button>
        </>
      }
    >
      <Body variant="secondary" size="sm" className="m-0">
        You are about to archive <strong>{label}</strong>. Soft-deleted
        enrollments can be restored later if capacity and uniqueness allow.
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
