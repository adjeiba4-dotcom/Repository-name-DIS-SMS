// routes/audit.routes.js

const express = require("express");
const router = express.Router();

const {
  getAuditLogs,
  getAuditLogById,
} = require("../controllers/audit.controller");
const {
  listAuditLogs,
  validateAuditId,
} = require("../validators/audit.validator");
const { validate } = require("../middleware/validation.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   - name: Audit Logs
 *     description: System audit trail and activity log APIs
 */

router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMINISTRATOR),
  listAuditLogs,
  validate,
  getAuditLogs
);

router.get(
  "/:id",
  authenticate,
  authorize(ROLES.ADMINISTRATOR),
  validateAuditId,
  validate,
  getAuditLogById
);

module.exports = router;
