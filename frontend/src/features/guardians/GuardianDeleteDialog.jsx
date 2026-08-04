import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Body } from "../../components/ui/Typography";

/**
 * Confirmation dialog before archiving (soft-deleting) a guardian.
 */
export default function GuardianDeleteDialog({
  open,
  guardian,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const name = guardian?.name || "this guardian";

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title="Archive guardian?"
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
            Archive Guardian
          </Button>
        </>
      }
    >
      <Body variant="secondary" size="sm" className="m-0">
        You are about to archive <strong>{name}</strong>
        {guardian?.guardianNumber ? ` (${guardian.guardianNumber})` : ""}. The
        record will be soft-deleted and can be restored later from archived
        guardians.
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
