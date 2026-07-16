const express = require("express");

const {
    getAuditLogs,
    getAuditLogById,
    createAuditLog,
    deleteAuditLog,
} = require("../controllers/audit.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createAuditValidator,
} = require("../validators/audit.validator");

const router = express.Router();

router.get("/", authenticate, getAuditLogs);

router.get("/:id", authenticate, getAuditLogById);

router.post(
    "/",
    authenticate,
    createAuditValidator,
    validate,
    createAuditLog
);

router.delete(
    "/:id",
    authenticate,
    deleteAuditLog
);

module.exports = router;