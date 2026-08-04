import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getAcademicYearById } from "../../services/academic-years/academicYear.service";
import AcademicYearDetails from "./AcademicYearDetails";
import { getApiErrorMessage } from "./academicYear.mappers";

/**
 * Academic year profile drawer — loads detail for view/edit entry.
 */
export default function AcademicYearProfile({
  open,
  academicYearId,
  onClose,
  onEdit,
}) {
  const detailQuery = useQuery({
    queryKey: ["academic-years", "detail", academicYearId],
    queryFn: async () => {
      const response = await getAcademicYearById(academicYearId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && academicYearId),
  });

  const academicYear = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        "Unable to load academic year details."
      )
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Academic Year Details"
      description="Schedule, status, terms, and related usage."
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
          {academicYear && !academicYear.deletedAt && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(academicYear)}
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
        <AcademicYearDetails academicYear={academicYear} />
      ) : null}
    </Drawer>
  );
}
