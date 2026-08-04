// components/profile/StatusBadge.jsx

import Badge from "../ui/Badge";

const DEFAULT_STATUS_MAP = {
  ACTIVE: "success",
  Active: "success",
  INACTIVE: "warning",
  Inactive: "warning",
  ARCHIVED: "secondary",
  Archived: "secondary",
  PENDING: "warning",
  Pending: "warning",
  APPROVED: "success",
  Approved: "success",
  REJECTED: "danger",
  Rejected: "danger",
  COMPLETED: "success",
  Completed: "success",
  FAILED: "danger",
  Failed: "danger",
};

/**
 * Status chip that maps status labels to Badge variants.
 * Pass statusMap to customize without hard-coding domain values in callers.
 */
export default function StatusBadge({
  status,
  label,
  statusMap = DEFAULT_STATUS_MAP,
  variant,
  size = "sm",
  className = "",
  ...props
}) {
  const display = label ?? status ?? "";
  if (display === "" || display == null) return null;

  const resolvedVariant =
    variant || statusMap[status] || statusMap[display] || "secondary";

  return (
    <Badge variant={resolvedVariant} size={size} className={className} {...props}>
      {display}
    </Badge>
  );
}
