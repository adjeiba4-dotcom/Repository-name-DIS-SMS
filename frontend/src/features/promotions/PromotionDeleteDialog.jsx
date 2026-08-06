import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function PromotionDeleteDialog({
  open,
  promotion,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const entityName =
    promotion?.studentName && promotion?.academicYearName
      ? `${promotion.studentName} · ${promotion.academicYearName}`
      : promotion?.studentName || "this promotion";

  return (
    <ConfirmDialog
      open={open}
      intent="archive"
      title="Archive promotion?"
      entityName={entityName}
      description={
        <>
          You are about to archive <strong>{entityName}</strong>. Soft-archived
          promotions can be restored later if no active duplicate exists.
        </>
      }
      confirmLabel="Archive Promotion"
      loading={loading}
      error={error}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
