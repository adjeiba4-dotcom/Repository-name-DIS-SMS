import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getTimetableById } from "../../services/timetables/timetable.service";
import TimetableDetails from "./TimetableDetails";
import { getApiErrorMessage } from "./timetable.mappers";

/**
 * Timetable profile drawer — loads detail for view/edit entry.
 */
export default function TimetableProfile({
  open,
  entryId,
  onClose,
  onEdit,
}) {
  const detailQuery = useQuery({
    queryKey: ["timetables", "detail", entryId],
    queryFn: async () => {
      const response = await getTimetableById(entryId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && entryId),
  });

  const entry = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        "Unable to load timetable details."
      )
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Timetable Details"
      description="Class, subject, teacher, day, time, and room for this slot."
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
          {entry && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(entry)}
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
        <TimetableDetails entry={entry} />
      ) : null}
    </Drawer>
  );
}
