import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function ReportCardDeleteDialog({
  open,
  reportCard,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const entityName =
    reportCard?.studentName && reportCard?.termName
      ? `${reportCard.studentName} · ${reportCard.termName}`
      : reportCard?.studentName || "this report card";

  return (
    <ConfirmDialog
      open={open}
      intent="archive"
      title="Archive report card?"
      entityName={entityName}
      description={
        <>
          You are about to archive <strong>{entityName}</strong>. Soft-archived
          report cards can be restored later if no active duplicate exists.
        </>
      }
      confirmLabel="Archive Report Card"
      loading={loading}
      error={error}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
