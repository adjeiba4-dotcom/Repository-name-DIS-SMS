const express = require("express");
const { getAuditLogs } = require("../controllers/audit.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, getAuditLogs);

module.exports = router;