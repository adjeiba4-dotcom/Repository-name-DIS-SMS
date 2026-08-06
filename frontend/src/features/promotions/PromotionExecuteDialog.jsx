import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function PromotionExecuteDialog({
  open,
  count = 0,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  return (
    <ConfirmDialog
      open={open}
      intent="restore"
      title="Execute promotions?"
      entityName={`${count} record${count === 1 ? "" : "s"}`}
      description={
        <>
          This will enroll continuing students into the destination academic
          year and mark graduated / withdrawn / transferred students inactive.
          Academic history is preserved. This action cannot be undone from the
          UI.
        </>
      }
      confirmLabel="Promote / Graduate"
      loading={loading}
      error={error}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
