import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function ResultDeleteDialog({
  open,
  result,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const entityName =
    result?.studentName && result?.subjectLabel
      ? `${result.studentName} · ${result.subjectLabel}`
      : result?.studentName || "this result";

  return (
    <ConfirmDialog
      open={open}
      intent="archive"
      title="Archive result?"
      entityName={entityName}
      description={
        <>
          You are about to archive <strong>{entityName}</strong>. Soft-archived
          results can be restored later if no active duplicate exists.
        </>
      }
      confirmLabel="Archive Result"
      loading={loading}
      error={error}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
