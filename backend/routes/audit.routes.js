const express = require("express");

const {
    getAuditLogs,
    getAuditLogById,
} = require("../controllers/audit.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Audit Logs
 *     description: System audit trail and activity log APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         userId:
 *           type: integer
 *           example: 12
 *         username:
 *           type: string
 *           example: admin
 *         action:
 *           type: string
 *           example: CREATE_STUDENT
 *         module:
 *           type: string
 *           example: Students
 *         description:
 *           type: string
 *           example: Created student record successfully.
 *         ipAddress:
 *           type: string
 *           example: 192.168.1.25
 *         userAgent:
 *           type: string
 *           example: Mozilla/5.0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2026-09-21T09:45:00Z
 */

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Retrieve all audit logs
 *     description: Returns all system audit logs. Accessible only to administrators.
 *     tags:
 *       - Audit Logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    getAuditLogs
);

/**
 * @swagger
 * /audit-logs/{id}:
 *   get:
 *     summary: Retrieve an audit log by ID
 *     description: Returns detailed information for a specific audit log entry.
 *     tags:
 *       - Audit Logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Audit log ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuditLog'
 *       404:
 *         description: Audit log not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    getAuditLogById
);

module.exports = router;