import { useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { Panel } from "../../components/dashboard";
import { DataTable } from "../../components/data-table";
import { getAuditLogs } from "../../services/settings/audit.service";
import { getApiErrorMessage, mapAuditToRow } from "./settings.mappers";

const COLUMNS = [
  { key: "createdAt", label: "When", sortable: true },
  { key: "module", label: "Module", sortable: true },
  { key: "action", label: "Action", sortable: true },
  { key: "entityType", label: "Entity" },
  { key: "userName", label: "User" },
  { key: "description", label: "Description" },
];

export default function AuditTrailPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ["audit-logs", page, pageSize, debouncedSearch],
    queryFn: () =>
      getAuditLogs({
        page,
        limit: pageSize,
        search: debouncedSearch || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  const rows = useMemo(
    () => (query.data?.data || []).map(mapAuditToRow),
    [query.data]
  );

  return (
    <Panel className="p-[var(--space-4)] sm:p-[var(--space-6)]">
      {query.isError ? (
        <p className="text-[var(--color-danger-600)]">
          {getApiErrorMessage(query.error, "Unable to load audit trail.")}
        </p>
      ) : (
        <DataTable
          title="Audit Trail"
          description="Immutable activity log of platform entity changes."
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
        />
      )}
    </Panel>
  );
}
