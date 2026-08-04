import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getTermById } from "../../services/terms/term.service";
import TermDetails from "./TermDetails";
import { getApiErrorMessage } from "./term.mappers";

/**
 * Term profile drawer — loads detail for view/edit entry.
 */
export default function TermProfile({ open, termId, onClose, onEdit }) {
  const detailQuery = useQuery({
    queryKey: ["terms", "detail", termId],
    queryFn: async () => {
      const response = await getTermById(termId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && termId),
  });

  const term = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(detailQuery.error, "Unable to load term details.")
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Term Details"
      description="Schedule, status, academic year, and related usage."
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
          {term && !term.deletedAt && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(term)}
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
      {open && !loading && !error ? <TermDetails term={term} /> : null}
    </Drawer>
  );
}
