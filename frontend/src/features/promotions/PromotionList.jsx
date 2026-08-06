import {
  Archive,
  CheckCircle2,
  Eye,
  Pencil,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { DataTable } from "../../components/data-table";
import { ExportButtons } from "../../components/export";
import { StatusBadge } from "../../components/profile";
import { Body, Caption } from "../../components/ui/Typography";
import { cn } from "../../utils/cn";
import {
  DECISION_FILTER_OPTIONS,
  WORKFLOW_FILTER_OPTIONS,
} from "./promotion.mappers";

export default function PromotionList({
  title = "Promotions",
  description = "Preview → Approve → Execute year-end decisions from published report cards.",
  rows = [],
  loading = false,
  page = 1,
  pageSize = 10,
  total = 0,
  search = "",
  sortKey = "studentName",
  sortDirection = "asc",
  workflowFilter = "all",
  decisionFilter = "all",
  selectedIds = [],
  canWrite = false,
  canApprove = false,
  canExecute = false,
  archivedView = false,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onWorkflowFilterChange,
  onDecisionFilterChange,
  onSelectionChange,
  onView,
  onEdit,
  onApprove,
  onExecute,
  onCancel,
  onArchive,
  onRestore,
  onExportExcel,
  onExportCsv,
  onExportPdf,
  onPrint,
  className = "",
}) {
  const selectedSet = new Set(selectedIds);

  function toggleRow(id) {
    if (!onSelectionChange) return;
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(Array.from(next));
  }

  function toggleAll() {
    if (!onSelectionChange) return;
    if (selectedIds.length === rows.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(rows.map((row) => row.id));
    }
  }

  const columns = [
    !archivedView
      ? {
          key: "_select",
          label: (
            <input
              type="checkbox"
              aria-label="Select all rows"
              checked={
                rows.length > 0 && selectedIds.length === rows.length
              }
              onChange={toggleAll}
            />
          ),
          render: (row) => (
            <input
              type="checkbox"
              aria-label={`Select ${row.studentName}`}
              checked={selectedSet.has(row.id)}
              onChange={() => toggleRow(row.id)}
            />
          ),
        }
      : null,
    {
      key: "studentName",
      label: "Student",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <Body
            variant="default"
            size="sm"
            className="m-0 truncate font-[number:var(--font-weight-semibold)]"
          >
            {row.studentName}
          </Body>
          <Caption variant="muted" size="sm" className="m-0 truncate">
            {row.admissionNo}
          </Caption>
        </div>
      ),
    },
    {
      key: "fromClassLabel",
      label: "From",
      sortable: true,
      className: "hidden md:table-cell",
    },
    {
      key: "toClassLabel",
      label: "To",
      sortable: true,
      className: "hidden lg:table-cell",
    },
    {
      key: "averageScoreLabel",
      label: "Avg",
      sortable: true,
      render: (row) => (
        <span className="font-[number:var(--font-weight-semibold)]">
          {row.averageScoreLabel}
        </span>
      ),
    },
    {
      key: "overallGrade",
      label: "Grade",
      sortable: true,
    },
    {
      key: "decisionLabel",
      label: "Decision",
      sortable: true,
      className: "hidden md:table-cell",
    },
    {
      key: "workflowLabel",
      label: "Workflow",
      sortable: true,
      render: (row) => (
        <StatusBadge
          status={row.workflowLabel}
          variant={
            row.workflowStatus === "EXECUTED"
              ? "success"
              : row.workflowStatus === "APPROVED"
                ? "info"
                : row.workflowStatus === "CANCELLED"
                  ? "danger"
                  : "secondary"
          }
        />
      ),
    },
  ].filter(Boolean);

  const filters = [
    onWorkflowFilterChange && !archivedView
      ? {
          id: "promotion-workflow-filter",
          label: "Workflow",
          value: workflowFilter,
          onChange: onWorkflowFilterChange,
          options: WORKFLOW_FILTER_OPTIONS,
        }
      : null,
    onDecisionFilterChange
      ? {
          id: "promotion-decision-filter",
          label: "Decision",
          value: decisionFilter,
          onChange: onDecisionFilterChange,
          options: DECISION_FILTER_OPTIONS,
        }
      : null,
  ].filter(Boolean);

  return (
    <DataTable
      className={cn(className)}
      title={title}
      description={description}
      columns={columns}
      rows={rows}
      loading={loading}
      emptyTitle={
        archivedView ? "No archived promotions" : "No promotions found"
      }
      emptyDescription={
        archivedView
          ? "Archived promotions will appear here."
          : "Generate recommendations from published report cards to start Preview → Approve → Execute."
      }
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortChange={onSortChange}
      searchable
      search={search}
      searchLabel="Search promotions"
      searchPlaceholder="Search student, admission no, or class…"
      onSearchChange={onSearchChange}
      filters={filters}
      toolbarActions={
        <ExportButtons
          onExportExcel={onExportExcel}
          onExportCsv={onExportCsv}
          onExportPdf={onExportPdf}
          onPrint={onPrint}
          disabled={rows.length === 0}
        />
      }
      getRowActions={(row) => {
        if (archivedView) {
          return canWrite
            ? [
                {
                  key: "restore",
                  label: "Restore",
                  icon: RotateCcw,
                  tone: "success",
                  onClick: () => onRestore?.(row),
                },
              ]
            : [];
        }

        const actions = [
          {
            key: "view",
            label: "View",
            icon: Eye,
            tone: "brand",
            onClick: () => onView?.(row),
          },
        ];

        if (canWrite && row.workflowStatus !== "EXECUTED") {
          actions.push({
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: () => onEdit?.(row),
          });
        }

        if (canApprove && row.workflowStatus === "DRAFT") {
          actions.push({
            key: "approve",
            label: "Approve",
            icon: CheckCircle2,
            tone: "success",
            onClick: () => onApprove?.([row.id]),
          });
        }

        if (canExecute && row.workflowStatus === "APPROVED") {
          actions.push({
            key: "execute",
            label: "Execute",
            icon: Play,
            tone: "brand",
            onClick: () => onExecute?.([row.id]),
          });
        }

        if (
          canWrite &&
          ["DRAFT", "APPROVED"].includes(row.workflowStatus)
        ) {
          actions.push({
            key: "cancel",
            label: "Cancel",
            icon: XCircle,
            onClick: () => onCancel?.([row.id]),
          });
        }

        if (canWrite) {
          actions.push({
            key: "archive",
            label: "Archive",
            icon: Archive,
            tone: "danger",
            onClick: () => onArchive?.(row),
          });
        }

        return actions;
      }}
    />
  );
}
