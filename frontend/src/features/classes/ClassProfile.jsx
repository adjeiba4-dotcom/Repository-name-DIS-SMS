import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getClassById } from "../../services/classes/class.service";
import ClassDetails from "./ClassDetails";
import { getApiErrorMessage } from "./class.mappers";

/**
 * Class profile drawer — loads detail for view/edit entry.
 */
export default function ClassProfile({ open, classId, onClose, onEdit }) {
  const detailQuery = useQuery({
    queryKey: ["classes", "detail", classId],
    queryFn: async () => {
      const response = await getClassById(classId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && classId),
  });

  const schoolClass = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(detailQuery.error, "Unable to load class details.")
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Class Details"
      description="Capacity, department, teacher, academic year, and related usage."
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
          {schoolClass && !schoolClass.deletedAt && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(schoolClass)}
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
        <ClassDetails schoolClass={schoolClass} />
      ) : null}
    </Drawer>
  );
}
