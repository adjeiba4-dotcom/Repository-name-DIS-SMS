import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Body } from "../../components/ui/Typography";

/**
 * Confirmation dialog before archiving (soft-deleting) a department.
 */
export default function DepartmentDeleteDialog({
  open,
  department,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const name = department?.name || "this department";

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title="Archive department?"
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
            Archive Department
          </Button>
        </>
      }
    >
      <Body variant="secondary" size="sm" className="m-0">
        You are about to archive <strong>{name}</strong>. Soft-deleted
        departments can be restored later from the archive view.
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
