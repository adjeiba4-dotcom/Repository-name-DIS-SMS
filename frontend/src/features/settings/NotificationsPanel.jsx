import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

import { Panel } from "../../components/dashboard";
import { DataTable } from "../../components/data-table";
import Button from "../../components/ui/Button";
import { toastError, toastSuccess } from "../../components/ui/Toast";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/settings/notification.service";
import { getApiErrorMessage, mapNotificationToRow } from "./settings.mappers";

const COLUMNS = [
  { key: "createdAt", label: "When", sortable: true },
  { key: "title", label: "Title", sortable: true },
  { key: "type", label: "Type" },
  { key: "channel", label: "Channel" },
  { key: "isRead", label: "Status" },
];

export default function NotificationsPanel() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ["notifications", page, pageSize, debouncedSearch],
    queryFn: () =>
      getNotifications({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(
    () => (query.data?.data || []).map(mapNotificationToRow),
    [query.data]
  );

  const handleMarkAll = async () => {
    try {
      const response = await markAllNotificationsRead();
      toastSuccess(response?.message || "All notifications marked as read.");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      toastError(getApiErrorMessage(error));
    }
  };

  return (
    <Panel className="p-[var(--space-4)] sm:p-[var(--space-6)]">
      {query.isError ? (
        <p className="text-[var(--color-danger-600)]">
          {getApiErrorMessage(query.error, "Unable to load notifications.")}
        </p>
      ) : (
        <DataTable
          title="Notifications"
          description="In-app message inbox. Email and SMS channels are prepared for future providers."
          columns={COLUMNS}
          rows={rows}
          page={page}
          pageSize={pageSize}
          total={query.data?.pagination?.total || 0}
          searchable
          search={search}
          onSearchChange={setSearch}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          loading={query.isLoading || query.isFetching}
          toolbarActions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-auto"
              onClick={handleMarkAll}
            >
              Mark all read
            </Button>
          }
          getRowActions={(row) =>
            row.isRead === "Unread"
              ? [
                  {
                    key: "read",
                    label: "Mark read",
                    tone: "brand",
                    onClick: async () => {
                      try {
                        await markNotificationRead(row.id);
                        toastSuccess("Notification marked as read.");
                        queryClient.invalidateQueries({
                          queryKey: ["notifications"],
                        });
                      } catch (error) {
                        toastError(getApiErrorMessage(error));
                      }
                    },
                  },
                ]
              : []
          }
        />
      )}
    </Panel>
  );
}
