import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getAttendanceById } from "../../services/attendance/attendance.service";
import AttendanceDetails from "./AttendanceDetails";
import { getApiErrorMessage } from "./attendance.mappers";

export default function AttendanceProfile({
  open,
  recordId,
  onClose,
  onEdit,
}) {
  const detailQuery = useQuery({
    queryKey: ["attendance", "detail", recordId],
    queryFn: async () => {
      const response = await getAttendanceById(recordId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && recordId),
  });

  const record = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        "Unable to load attendance details."
      )
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Attendance Details"
      description="Student mark for the selected academic day."
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-[var(--space-2)]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-auto"
            onClick={onClose}
          >
            Close
          </Button>
          {record && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(record)}
            >
              Edit
            </Button>
          ) : null}
        </div>
      }
    >
      {open && loading ? <ProfileSkeleton /> : null}
      {open && !loading && error ? (
        <Alert variant="danger" title="Details unavailable">
          {error}
        </Alert>
      ) : null}
      {open && !loading && !error ? (
        <AttendanceDetails record={record} />
      ) : null}
    </Drawer>
  );
}
