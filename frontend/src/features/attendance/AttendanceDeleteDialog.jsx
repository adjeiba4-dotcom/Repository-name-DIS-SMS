import ConfirmDialog from "../../components/ui/ConfirmDialog";

/**
 * Confirmation before permanently deleting an attendance record.
 */
export default function AttendanceDeleteDialog({
  open,
  record,
  loading = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  const entityName =
    record?.studentName && record?.attendanceDateLabel
      ? `${record.studentName} on ${record.attendanceDateLabel}`
      : record?.studentName || "this attendance record";

  return (
    <ConfirmDialog
      open={open}
      intent="delete"
      title="Delete attendance record?"
      entityName={entityName}
      description={
        <>
          You are about to permanently delete attendance for{" "}
          <strong>{entityName}</strong>. This cannot be undone. Soft archive is
          not available for attendance records.
        </>
      }
      confirmLabel="Delete Record"
      loading={loading}
      error={error}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
