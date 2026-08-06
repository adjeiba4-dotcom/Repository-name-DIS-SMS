// routes/reportCard.routes.js

const express = require("express");
const router = express.Router();

const reportCardController = require("../controllers/reportCard.controller");
const reportCardValidator = require("../validators/reportCard.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");
const { audit } = require("../middleware/audit.middleware");

const ROLES = require("../constants/roles");

const writeRoles = [
    ROLES.ADMINISTRATOR,
    ROLES.HEADMASTER,
    ROLES.REGISTRAR,
    ROLES.TEACHER,
];

const readRoles = [
    ROLES.ADMINISTRATOR,
    ROLES.HEADMASTER,
    ROLES.REGISTRAR,
    ROLES.TEACHER,
];

const verifyRoles = [
    ROLES.ADMINISTRATOR,
    ROLES.HEADMASTER,
    ROLES.REGISTRAR,
];

const adminRoles = [ROLES.ADMINISTRATOR];

/**
 * @swagger
 * tags:
 *   name: Report Cards
 *   description: Report Cards Engine — snapshots from published Results (Generated → Verified → Published → Locked)
 */

/**
 * @swagger
 * /report-cards:
 *   get:
 *     summary: Retrieve report cards (paginated + search + filters)
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: termId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: workflowStatus
 *         schema:
 *           type: string
 *           enum: [DRAFT, GENERATED, VERIFIED, PUBLISHED, LOCKED]
 *     responses:
 *       200:
 *         description: Report cards retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(...readRoles),
    reportCardValidator.listReportCards,
    validate,
    reportCardController.getReportCards
);

/**
 * @swagger
 * /report-cards/archived:
 *   get:
 *     summary: Retrieve archived report cards
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived report cards retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(...readRoles),
    reportCardValidator.listReportCards,
    validate,
    reportCardController.getArchivedReportCards
);

/**
 * @swagger
 * /report-cards/stats:
 *   get:
 *     summary: Report card statistics (overview or class breakdown)
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [overview, class]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully.
 */
router.get(
    "/stats",
    authenticate,
    authorize(...readRoles),
    reportCardValidator.statsQuery,
    validate,
    reportCardController.getStats
);

/**
 * @swagger
 * /report-cards/templates:
 *   get:
 *     summary: List available report card templates
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Templates retrieved successfully.
 */
router.get(
    "/templates",
    authenticate,
    authorize(...readRoles),
    reportCardController.getTemplates
);

/**
 * @swagger
 * /report-cards/generate:
 *   post:
 *     summary: Generate a report card from published results (single student)
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Report card generated successfully.
 */
router.post(
    "/generate",
    authenticate,
    authorize(...writeRoles),
    reportCardValidator.generateReportCard,
    validate,
    audit("GENERATE", "Report Cards", {
        entityType: "ReportCard",
        includeBody: true,
    }),
    reportCardController.generateReportCard
);

/**
 * @swagger
 * /report-cards/generate-bulk:
 *   post:
 *     summary: Bulk-generate report cards for an entire class
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bulk generation completed.
 */
router.post(
    "/generate-bulk",
    authenticate,
    authorize(...writeRoles),
    reportCardValidator.generateBulk,
    validate,
    audit("GENERATE_BULK", "Report Cards", {
        entityType: "ReportCard",
        includeBody: true,
    }),
    reportCardController.generateBulk
);

/**
 * @swagger
 * /report-cards/verify:
 *   post:
 *     summary: Verify report cards (Generated → Verified)
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/verify",
    authenticate,
    authorize(...verifyRoles),
    reportCardValidator.scopeAction,
    validate,
    audit("VERIFY", "Report Cards", {
        entityType: "ReportCard",
        includeBody: true,
    }),
    reportCardController.verifyReportCards
);

/**
 * @swagger
 * /report-cards/unverify:
 *   post:
 *     summary: Unverify report cards (Administrator only)
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/unverify",
    authenticate,
    authorize(...adminRoles),
    reportCardValidator.scopeAction,
    validate,
    audit("UNVERIFY", "Report Cards", {
        entityType: "ReportCard",
        includeBody: true,
    }),
    reportCardController.unverifyReportCards
);

/**
 * @swagger
 * /report-cards/publish:
 *   post:
 *     summary: Publish report cards (Verified → Published)
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/publish",
    authenticate,
    authorize(...writeRoles),
    reportCardValidator.scopeAction,
    validate,
    audit("PUBLISH", "Report Cards", {
        entityType: "ReportCard",
        includeBody: true,
    }),
    reportCardController.publishReportCards
);

/**
 * @swagger
 * /report-cards/unpublish:
 *   post:
 *     summary: Unpublish report cards (Administrator only)
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/unpublish",
    authenticate,
    authorize(...adminRoles),
    reportCardValidator.scopeAction,
    validate,
    audit("UNPUBLISH", "Report Cards", {
        entityType: "ReportCard",
        includeBody: true,
    }),
    reportCardController.unpublishReportCards
);

/**
 * @swagger
 * /report-cards/lock:
 *   post:
 *     summary: Lock report cards (Published → Locked)
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/lock",
    authenticate,
    authorize(...writeRoles),
    reportCardValidator.scopeAction,
    validate,
    audit("LOCK", "Report Cards", {
        entityType: "ReportCard",
        includeBody: true,
    }),
    reportCardController.lockReportCards
);

/**
 * @swagger
 * /report-cards/unlock:
 *   post:
 *     summary: Unlock report cards (Administrator only)
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/unlock",
    authenticate,
    authorize(...adminRoles),
    reportCardValidator.scopeAction,
    validate,
    audit("UNLOCK", "Report Cards", {
        entityType: "ReportCard",
        includeBody: true,
    }),
    reportCardController.unlockReportCards
);

/**
 * @swagger
 * /report-cards/{id}/preview:
 *   get:
 *     summary: A4 render model for preview / PDF / print
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/:id/preview",
    authenticate,
    authorize(...readRoles),
    reportCardValidator.validateId,
    validate,
    reportCardController.getPreview
);

/**
 * @swagger
 * /report-cards/{id}:
 *   get:
 *     summary: Get report card by ID
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/:id",
    authenticate,
    authorize(...readRoles),
    reportCardValidator.validateId,
    validate,
    reportCardController.getReportCardById
);

/**
 * @swagger
 * /report-cards/{id}:
 *   put:
 *     summary: Update remarks, promotion decision, or refresh snapshot
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    reportCardValidator.validateId,
    reportCardValidator.updateReportCard,
    validate,
    audit("UPDATE", "Report Cards", {
        entityType: "ReportCard",
        includeBody: true,
    }),
    reportCardController.updateReportCard
);

/**
 * @swagger
 * /report-cards/{id}:
 *   delete:
 *     summary: Soft-archive a report card
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    reportCardValidator.validateId,
    validate,
    audit("ARCHIVE", "Report Cards", {
        entityType: "ReportCard",
    }),
    reportCardController.archiveReportCard
);

/**
 * @swagger
 * /report-cards/{id}/restore:
 *   patch:
 *     summary: Restore an archived report card
 *     tags: [Report Cards]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(...writeRoles),
    reportCardValidator.validateId,
    validate,
    audit("RESTORE", "Report Cards", {
        entityType: "ReportCard",
    }),
    reportCardController.restoreReportCard
);

module.exports = router;
