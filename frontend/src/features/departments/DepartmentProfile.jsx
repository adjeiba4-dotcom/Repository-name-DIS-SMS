import { useQuery } from "@tanstack/react-query";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { ProfileSkeleton } from "../../components/ui/Skeleton";
import { getDepartmentById } from "../../services/departments/department.service";
import DepartmentDetails from "./DepartmentDetails";
import { getApiErrorMessage } from "./department.mappers";

/**
 * Department profile drawer — loads detail for view/edit entry.
 */
export default function DepartmentProfile({
  open,
  departmentId,
  onClose,
  onEdit,
}) {
  const detailQuery = useQuery({
    queryKey: ["departments", "detail", departmentId],
    queryFn: async () => {
      const response = await getDepartmentById(departmentId);
      return response?.data ?? null;
    },
    enabled: Boolean(open && departmentId),
  });

  const department = detailQuery.data ?? null;
  const loading = detailQuery.isLoading || detailQuery.isFetching;
  const error = detailQuery.isError
    ? getApiErrorMessage(
        detailQuery.error,
        "Unable to load department details."
      )
    : "";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Department Details"
      description="Code, status, linked teachers and subjects, and activity history."
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
          {department && !department.deletedAt && !loading && !error ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="w-auto"
              onClick={() => onEdit?.(department)}
            >
              Edit
            </Button>
          ) : null}
        </div>
      }
    >
      {open && loading ? <ProfileSkeleton /> : null}
      {open && !loading && error ? (
        <Alert
          variant="error"
          title="Details unavailable"
          message={error}
        />
      ) : null}
      {open && !loading && !error ? (
        <DepartmentDetails department={department} />
      ) : null}
    </Drawer>
  );
}
