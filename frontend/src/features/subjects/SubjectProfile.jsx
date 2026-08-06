import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getSubjectById } from "../../services/subjects/subject.service";
import SubjectDetails from "./SubjectDetails";
import { getApiErrorMessage } from "./subject.mappers";

/**
 * Subject profile drawer — loads detail for view/edit entry.
 */
export default function SubjectProfile({ open, subjectId, onClose, onEdit }) {
  const detailQuery = useQuery({
    queryKey: ["subjects", "detail", subjectId],
    queryFn: async () => {
      const response = await getSubjectById(subjectId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && subjectId),
  });

  const subject = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(detailQuery.error, "Unable to load subject details.")
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Subject Details"
      description="Category, credits, department, class assignment, and related usage."
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
          {subject && !subject.deletedAt && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(subject)}
            >
              Edit
            </Button>
          ) : null}
        </div>
      }
    >
      {open && loading ? <ProfileSkeleton /> : null}
      {open && !loading && error ? (
        <Alert variant="error" title="Details unavailable" message={error} />
      ) : null}
      {open && !loading && !error ? (
        <SubjectDetails subject={subject} />
      ) : null}
    </Drawer>
  );
}
