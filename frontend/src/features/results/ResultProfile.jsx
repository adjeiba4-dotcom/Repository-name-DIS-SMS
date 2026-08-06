import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getResultById } from "../../services/results/result.service";
import ResultDetails from "./ResultDetails";
import { getApiErrorMessage } from "./result.mappers";

export default function ResultProfile({
  open,
  resultId,
  onClose,
  onToggleVerify,
  onTogglePublish,
  onToggleLock,
  onArchive,
}) {
  const detailQuery = useQuery({
    queryKey: ["results", "detail", resultId],
    queryFn: async () => {
      const response = await getResultById(resultId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && resultId),
  });

  const result = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(detailQuery.error, "Unable to load result details.")
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Result Details"
      description="Composite CA + examination score, grade, positions, and workflow state."
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
          {result && !loading && !error ? (
            <>
              {onToggleVerify && !result.isVerified && !result.isLocked ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-auto"
                  onClick={() => onToggleVerify?.(result)}
                >
                  Verify
                </Button>
              ) : null}
              {onTogglePublish ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-auto"
                  onClick={() => onTogglePublish?.(result)}
                >
                  {result.isPublished ? "Unpublish" : "Publish"}
                </Button>
              ) : null}
              {onToggleLock ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-auto"
                  onClick={() => onToggleLock?.(result)}
                >
                  {result.isLocked ? "Unlock" : "Lock"}
                </Button>
              ) : null}
              {onArchive ? (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  className="w-auto"
                  onClick={() => onArchive?.(result)}
                >
                  Archive
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      }
    >
      {open && loading ? <ProfileSkeleton /> : null}
      {open && !loading && error ? (
        <Alert variant="error" title="Details unavailable">
          {error}
        </Alert>
      ) : null}
      {open && !loading && !error ? <ResultDetails result={result} /> : null}
    </Drawer>
  );
}
