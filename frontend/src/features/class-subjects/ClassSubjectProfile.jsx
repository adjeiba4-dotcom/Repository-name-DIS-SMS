import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getClassSubjectById } from "../../services/class-subjects/classSubject.service";
import ClassSubjectDetails from "./ClassSubjectDetails";
import { getApiErrorMessage } from "./classSubject.mappers";

/**
 * Class subject profile drawer — loads detail for view/edit entry.
 */
export default function ClassSubjectProfile({
  open,
  allocationId,
  onClose,
  onEdit,
}) {
  const detailQuery = useQuery({
    queryKey: ["class-subjects", "detail", allocationId],
    queryFn: async () => {
      const response = await getClassSubjectById(allocationId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && allocationId),
  });

  const allocation = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        "Unable to load allocation details."
      )
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Allocation Details"
      description="Class, subject, teacher assignment, academic year, term, and weekly periods."
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
          {allocation && !allocation.deletedAt && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(allocation)}
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
        <ClassSubjectDetails allocation={allocation} />
      ) : null}
    </Drawer>
  );
}
