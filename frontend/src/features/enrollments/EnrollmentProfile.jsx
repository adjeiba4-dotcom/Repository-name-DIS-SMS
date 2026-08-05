import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getEnrollmentById } from "../../services/enrollments/enrollment.service";
import EnrollmentDetails from "./EnrollmentDetails";
import { getApiErrorMessage } from "./enrollment.mappers";

/**
 * Enrollment profile drawer — loads detail for view/edit entry.
 */
export default function EnrollmentProfile({
  open,
  enrollmentId,
  onClose,
  onEdit,
}) {
  const detailQuery = useQuery({
    queryKey: ["enrollments", "detail", enrollmentId],
    queryFn: async () => {
      const response = await getEnrollmentById(enrollmentId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && enrollmentId),
  });

  const enrollment = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        "Unable to load enrollment details."
      )
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Enrollment Details"
      description="Student placement, class, academic year, term, and enrollment date."
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
          {enrollment && !enrollment.deletedAt && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(enrollment)}
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
        <EnrollmentDetails enrollment={enrollment} />
      ) : null}
    </Drawer>
  );
}
