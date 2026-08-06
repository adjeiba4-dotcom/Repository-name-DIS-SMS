// routes/assessment.routes.js

const express = require("express");
const router = express.Router();

const assessmentController = require("../controllers/assessment.controller");
const assessmentValidator = require("../validators/assessment.validator");

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

/**
 * @swagger
 * tags:
 *   name: Assessments
 *   description: Assessment Management APIs
 */

/**
 * @swagger
 * /assessments:
 *   get:
 *     summary: Retrieve assessments (paginated + search + filters)
 *     tags: [Assessments]
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
 *         name: subjectId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: assessmentType
 *         schema:
 *           type: string
 *           enum: [CLASS_WORK, HOMEWORK, QUIZ, ASSIGNMENT, PRACTICAL, PROJECT, ORAL_TEST, MID_TERM, CONTINUOUS_ASSESSMENT]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Assessments retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(...readRoles),
    assessmentValidator.listAssessments,
    validate,
    assessmentController.getAssessments
);

/**
 * @swagger
 * /assessments/archived:
 *   get:
 *     summary: Retrieve archived assessments
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived assessments retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(...readRoles),
    assessmentValidator.listAssessments,
    validate,
    assessmentController.getArchivedAssessments
);

/**
 * @swagger
 * /assessments/stats:
 *   get:
 *     summary: Retrieve assessment statistics and analytics
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [overview, class, subject, teacher, type, student]
 *     responses:
 *       200:
 *         description: Assessment statistics retrieved successfully.
 */
router.get(
    "/stats",
    authenticate,
    authorize(...readRoles),
    assessmentValidator.statsAssessments,
    validate,
    assessmentController.getStats
);

/**
 * @swagger
 * /assessments:
 *   post:
 *     summary: Create an assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Assessment created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(...writeRoles),
    assessmentValidator.createAssessment,
    validate,
    audit("CREATE", "Assessments", {
        entityType: "Assessment",
        includeBody: true,
    }),
    assessmentController.createAssessment
);

/**
 * @swagger
 * /assessments/{id}/roster:
 *   get:
 *     summary: Retrieve assessment score roster for enrolled students
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assessment score roster retrieved successfully.
 */
router.get(
    "/:id/roster",
    authenticate,
    authorize(...readRoles),
    assessmentValidator.validateAssessmentId,
    validate,
    assessmentController.getRoster
);

/**
 * @swagger
 * /assessments/{id}/scores/bulk:
 *   post:
 *     summary: Bulk upsert or clear assessment scores
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assessment scores processed successfully.
 */
router.post(
    "/:id/scores/bulk",
    authenticate,
    authorize(...writeRoles),
    assessmentValidator.bulkScores,
    validate,
    audit("BULK_UPDATE", "Assessments", {
        entityType: "AssessmentScore",
        includeBody: true,
        recordIdResolver: (req) => Number(req.params.id),
    }),
    assessmentController.bulkScores
);

/**
 * @swagger
 * /assessments/{id}/restore:
 *   patch:
 *     summary: Restore an archived assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assessment restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(...writeRoles),
    assessmentValidator.validateAssessmentId,
    validate,
    audit("RESTORE", "Assessments", {
        entityType: "Assessment",
        recordIdResolver: (req) => Number(req.params.id),
    }),
    assessmentController.restoreAssessment
);

/**
 * @swagger
 * /assessments/{id}:
 *   get:
 *     summary: Retrieve assessment by ID
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assessment retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(...readRoles),
    assessmentValidator.validateAssessmentId,
    validate,
    assessmentController.getAssessmentById
);

/**
 * @swagger
 * /assessments/{id}:
 *   put:
 *     summary: Update an assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assessment updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    assessmentValidator.updateAssessment,
    validate,
    audit("UPDATE", "Assessments", {
        entityType: "Assessment",
        includeBody: true,
    }),
    assessmentController.updateAssessment
);

/**
 * @swagger
 * /assessments/{id}:
 *   delete:
 *     summary: Archive an assessment
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assessment archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    assessmentValidator.validateAssessmentId,
    validate,
    audit("ARCHIVE", "Assessments", {
        entityType: "Assessment",
        recordIdResolver: (req) => Number(req.params.id),
    }),
    assessmentController.archiveAssessment
);

module.exports = router;
