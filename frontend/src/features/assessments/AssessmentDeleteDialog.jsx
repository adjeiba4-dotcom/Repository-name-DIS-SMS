import ConfirmDialog from "../../components/ui/ConfirmDialog";

/**
 * Confirmation before archiving an assessment.
 */
export default function AssessmentDeleteDialog({
  open,
  assessment,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const entityName =
    assessment?.title ||
    assessment?.assessmentTypeLabel ||
    "this assessment";

  return (
    <ConfirmDialog
      open={open}
      intent="archive"
      title="Archive assessment?"
      entityName={entityName}
      description={
        <>
          You are about to archive <strong>{entityName}</strong>. Student scores
          remain attached and the assessment can be restored later.
        </>
      }
      confirmLabel="Archive Assessment"
      loading={loading}
      error={error}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
