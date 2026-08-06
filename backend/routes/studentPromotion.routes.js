// routes/studentPromotion.routes.js

const express = require("express");
const router = express.Router();

const studentPromotionController = require("../controllers/studentPromotion.controller");
const studentPromotionValidator = require("../validators/studentPromotion.validator");

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

const approveRoles = [
    ROLES.ADMINISTRATOR,
    ROLES.HEADMASTER,
    ROLES.REGISTRAR,
];

const adminRoles = [ROLES.ADMINISTRATOR];

/**
 * @swagger
 * tags:
 *   name: Student Promotions
 *   description: Student Promotion & Graduation — recommend from published report cards, approve, execute enrollments / exits
 */

/**
 * @swagger
 * /student-promotions:
 *   get:
 *     summary: Retrieve student promotions (paginated + filters)
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: academicYearId
 *         schema: { type: integer }
 *       - in: query
 *         name: classId
 *         schema: { type: integer }
 *       - in: query
 *         name: decision
 *         schema:
 *           type: string
 *           enum: [PENDING, PROMOTED, PROMOTED_ON_PROBATION, REPEAT, GRADUATED, WITHDRAWN, TRANSFERRED]
 *       - in: query
 *         name: workflowStatus
 *         schema:
 *           type: string
 *           enum: [DRAFT, APPROVED, EXECUTED, CANCELLED]
 *     responses:
 *       200:
 *         description: Student promotions retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(...readRoles),
    studentPromotionValidator.listPromotions,
    validate,
    studentPromotionController.getPromotions
);

/**
 * @swagger
 * /student-promotions/archived:
 *   get:
 *     summary: Retrieve archived student promotions
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/archived",
    authenticate,
    authorize(...readRoles),
    studentPromotionValidator.listPromotions,
    validate,
    studentPromotionController.getArchivedPromotions
);

/**
 * @swagger
 * /student-promotions/graduates:
 *   get:
 *     summary: Retrieve graduated students (promotion history filter)
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/graduates",
    authenticate,
    authorize(...readRoles),
    studentPromotionValidator.listPromotions,
    validate,
    studentPromotionController.getGraduates
);

/**
 * @swagger
 * /student-promotions/stats:
 *   get:
 *     summary: Promotion statistics (overview or class breakdown)
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [overview, class]
 */
router.get(
    "/stats",
    authenticate,
    authorize(...readRoles),
    studentPromotionValidator.statsQuery,
    validate,
    studentPromotionController.getStats
);

/**
 * @swagger
 * /student-promotions/history/{studentId}:
 *   get:
 *     summary: Promotion history for a student
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/history/:studentId",
    authenticate,
    authorize(...readRoles),
    studentPromotionValidator.validateStudentId,
    validate,
    studentPromotionController.getStudentHistory
);

/**
 * @swagger
 * /student-promotions/recommend:
 *   post:
 *     summary: Generate draft promotion recommendations from published report cards
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Creates DRAFT promotions for a class and/or student from published/locked
 *       report cards. Pass regenerate=true to refresh non-executed drafts.
 */
router.post(
    "/recommend",
    authenticate,
    authorize(...writeRoles),
    studentPromotionValidator.recommend,
    validate,
    audit("RECOMMEND", "Student Promotions", {
        entityType: "StudentPromotion",
        includeBody: true,
    }),
    studentPromotionController.recommend
);

/**
 * @swagger
 * /student-promotions/approve:
 *   post:
 *     summary: Approve draft promotions (bulk)
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/approve",
    authenticate,
    authorize(...approveRoles),
    studentPromotionValidator.bulkIds,
    validate,
    audit("APPROVE", "Student Promotions", {
        entityType: "StudentPromotion",
        includeBody: true,
    }),
    studentPromotionController.approve
);

/**
 * @swagger
 * /student-promotions/unapprove:
 *   post:
 *     summary: Reverse approval back to draft (Administrator)
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/unapprove",
    authenticate,
    authorize(...adminRoles),
    studentPromotionValidator.bulkIds,
    validate,
    audit("UNAPPROVE", "Student Promotions", {
        entityType: "StudentPromotion",
        includeBody: true,
    }),
    studentPromotionController.unapprove
);

/**
 * @swagger
 * /student-promotions/execute:
 *   post:
 *     summary: Execute approved promotions / graduations (creates enrollments where applicable)
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/execute",
    authenticate,
    authorize(...approveRoles),
    studentPromotionValidator.execute,
    validate,
    audit("EXECUTE", "Student Promotions", {
        entityType: "StudentPromotion",
        includeBody: true,
    }),
    studentPromotionController.execute
);

/**
 * @swagger
 * /student-promotions/cancel:
 *   post:
 *     summary: Cancel draft or approved promotions
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/cancel",
    authenticate,
    authorize(...writeRoles),
    studentPromotionValidator.bulkIds,
    validate,
    audit("CANCEL", "Student Promotions", {
        entityType: "StudentPromotion",
        includeBody: true,
    }),
    studentPromotionController.cancel
);

/**
 * @swagger
 * /student-promotions/{id}:
 *   get:
 *     summary: Get student promotion by ID
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/:id",
    authenticate,
    authorize(...readRoles),
    studentPromotionValidator.validatePromotionId,
    validate,
    studentPromotionController.getPromotionById
);

/**
 * @swagger
 * /student-promotions/{id}:
 *   put:
 *     summary: Update promotion decision / destination / remarks (pre-execute)
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    studentPromotionValidator.validatePromotionId,
    studentPromotionValidator.updatePromotion,
    validate,
    audit("UPDATE", "Student Promotions", {
        entityType: "StudentPromotion",
        includeBody: true,
    }),
    studentPromotionController.updatePromotion
);

/**
 * @swagger
 * /student-promotions/{id}:
 *   delete:
 *     summary: Soft-archive a student promotion
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    studentPromotionValidator.validatePromotionId,
    validate,
    audit("ARCHIVE", "Student Promotions", {
        entityType: "StudentPromotion",
    }),
    studentPromotionController.archivePromotion
);

/**
 * @swagger
 * /student-promotions/{id}/restore:
 *   patch:
 *     summary: Restore an archived student promotion
 *     tags: [Student Promotions]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(...writeRoles),
    studentPromotionValidator.validatePromotionId,
    validate,
    audit("RESTORE", "Student Promotions", {
        entityType: "StudentPromotion",
    }),
    studentPromotionController.restorePromotion
);

module.exports = router;
