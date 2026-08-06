import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getAssessmentById } from "../../services/assessments/assessment.service";
import AssessmentDetails from "./AssessmentDetails";
import { getApiErrorMessage } from "./assessment.mappers";

export default function AssessmentProfile({
  open,
  assessmentId,
  onClose,
  onEdit,
  onScores,
}) {
  const detailQuery = useQuery({
    queryKey: ["assessments", "detail", assessmentId],
    queryFn: async () => {
      const response = await getAssessmentById(assessmentId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && assessmentId),
  });

  const assessment = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        "Unable to load assessment details."
      )
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Assessment Details"
      description="Scope, type, teacher, and score coverage for this assessment."
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
          {assessment && !loading && !error ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-auto"
                onClick={() => onScores?.(assessment)}
              >
                Enter Scores
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-auto"
                onClick={() => onEdit?.(assessment)}
              >
                Edit
              </Button>
            </>
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
        <AssessmentDetails assessment={assessment} />
      ) : null}
    </Drawer>
  );
}
