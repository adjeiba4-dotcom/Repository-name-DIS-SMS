import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getTeacherSubjectById } from "../../services/teacher-subjects/teacherSubject.service";
import TeacherSubjectDetails from "./TeacherSubjectDetails";
import { getApiErrorMessage } from "./teacherSubject.mappers";

/**
 * Teacher subject profile drawer — loads detail for view/edit entry.
 */
export default function TeacherSubjectProfile({
  open,
  assignmentId,
  onClose,
  onEdit,
}) {
  const detailQuery = useQuery({
    queryKey: ["teacher-subjects", "detail", assignmentId],
    queryFn: async () => {
      const response = await getTeacherSubjectById(assignmentId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && assignmentId),
  });

  const assignment = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        "Unable to load assignment details."
      )
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Assignment Details"
      description="Teacher, subject, academic year, term, and weekly teaching load."
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
          {assignment && !assignment.deletedAt && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(assignment)}
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
        <TeacherSubjectDetails assignment={assignment} />
      ) : null}
    </Drawer>
  );
}
