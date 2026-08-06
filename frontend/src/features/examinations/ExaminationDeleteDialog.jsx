import ConfirmDialog from "../../components/ui/ConfirmDialog";

/**
 * Confirmation before archiving an examination.
 */
export default function ExaminationDeleteDialog({
  open,
  examination,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const entityName =
    examination?.name ||
    examination?.examinationTypeLabel ||
    "this examination";

  return (
    <ConfirmDialog
      open={open}
      intent="archive"
      title="Archive examination?"
      entityName={entityName}
      description={
        <>
          You are about to archive <strong>{entityName}</strong>. Student scores
          remain attached and the examination can be restored later.
        </>
      }
      confirmLabel="Archive Examination"
      loading={loading}
      error={error}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
