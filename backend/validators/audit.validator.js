// validators/audit.validator.js

const { param, query } = require("express-validator");

const listAuditLogs = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("module").optional().trim(),
  query("action").optional().trim(),
  query("entityType").optional().trim(),
  query("userId").optional().isInt({ min: 1 }),
  query("search").optional().trim(),
];

const validateAuditId = [
  param("id").isInt({ min: 1 }).withMessage("Audit log ID must be a positive integer."),
];

module.exports = {
  listAuditLogs,
  validateAuditId,
};
