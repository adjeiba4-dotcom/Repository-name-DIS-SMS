import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getExaminationById } from "../../services/examinations/examination.service";
import ExaminationDetails from "./ExaminationDetails";
import { getApiErrorMessage } from "./examination.mappers";

export default function ExaminationProfile({
  open,
  examinationId,
  onClose,
  onEdit,
  onScores,
  onToggleLock,
  onArchive,
}) {
  const detailQuery = useQuery({
    queryKey: ["examinations", "detail", examinationId],
    queryFn: async () => {
      const response = await getExaminationById(examinationId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && examinationId),
  });

  const examination = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const isLocked = Boolean(examination?.isLocked);
  const error = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        "Unable to load examination details."
      )
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Examination Details"
      description="Scope, type, teacher, and score coverage for this examination."
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
          {examination && !loading && !error ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-auto"
                onClick={() => onScores?.(examination)}
                disabled={isLocked}
              >
                Enter Scores
              </Button>
              {isLocked ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-auto"
                  onClick={() => onToggleLock?.(examination)}
                >
                  Unlock
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-auto"
                  onClick={() => onToggleLock?.(examination)}
                >
                  Lock
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-auto"
                onClick={() => onEdit?.(examination)}
                disabled={isLocked}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="w-auto"
                onClick={() => onArchive?.(examination)}
              >
                Archive
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
        <ExaminationDetails examination={examination} />
      ) : null}
    </Drawer>
  );
}
