import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Body } from "../../components/ui/Typography";

/**
 * Confirmation dialog before archiving (soft-deleting) an academic year.
 */
export default function AcademicYearDeleteDialog({
  open,
  academicYear,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const name = academicYear?.name || "this academic year";

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title="Archive academic year?"
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
            Archive Academic Year
          </Button>
        </>
      }
    >
      <Body variant="secondary" size="sm" className="m-0">
        You are about to archive <strong>{name}</strong>. Archiving is blocked
        when the year is still referenced by terms, enrollments, or other
        academic records. Soft-deleted years can be restored later.
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
