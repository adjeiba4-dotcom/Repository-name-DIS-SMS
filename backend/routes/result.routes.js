// routes/result.routes.js

const express = require("express");
const router = express.Router();

const resultController = require("../controllers/result.controller");
const resultValidator = require("../validators/result.validator");

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
 *   name: Results
 *   description: Results Engine — CA + Examination composite results (Draft → Generated → Verified → Published → Locked)
 */

/**
 * @swagger
 * /results:
 *   get:
 *     summary: Retrieve results (paginated + search + filters)
 *     tags: [Results]
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
 *         name: isPassed
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isLocked
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Results retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(...readRoles),
    resultValidator.listResults,
    validate,
    resultController.getResults
);

/**
 * @swagger
 * /results/archived:
 *   get:
 *     summary: Retrieve archived results
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived results retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(...readRoles),
    resultValidator.listResults,
    validate,
    resultController.getArchivedResults
);

/**
 * @swagger
 * /results/stats:
 *   get:
 *     summary: Result analytics (overview/class/subject/student/grade)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [overview, class, subject, student, grade]
 *     responses:
 *       200:
 *         description: Result statistics retrieved successfully.
 */
router.get(
    "/stats",
    authenticate,
    authorize(...readRoles),
    resultValidator.statsResults,
    validate,
    resultController.getStats
);

/**
 * @swagger
 * /results/weightings:
 *   get:
 *     summary: Retrieve CA/Exam weightings, pass mark, and active grade bands
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weightings retrieved successfully.
 */
router.get(
    "/weightings",
    authenticate,
    authorize(...readRoles),
    resultController.getWeightings
);

/**
 * @swagger
 * /results/broadsheet:
 *   get:
 *     summary: Class broadsheet (students × subjects matrix)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Broadsheet retrieved successfully.
 */
router.get(
    "/broadsheet",
    authenticate,
    authorize(...readRoles),
    resultValidator.scopeReport,
    validate,
    resultController.getBroadsheet
);

/**
 * @swagger
 * /results/merit-list:
 *   get:
 *     summary: Class merit list ranked by average final score
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merit list retrieved successfully.
 */
router.get(
    "/merit-list",
    authenticate,
    authorize(...readRoles),
    resultValidator.scopeReport,
    validate,
    resultController.getMeritList
);

/**
 * @swagger
 * /results/student-profile/{studentId}:
 *   get:
 *     summary: Student result profile across subjects for a term/class
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student result profile retrieved successfully.
 */
router.get(
    "/student-profile/:studentId",
    authenticate,
    authorize(...readRoles),
    resultValidator.studentProfile,
    validate,
    resultController.getStudentProfile
);

/**
 * @swagger
 * /results/generate:
 *   post:
 *     summary: Generate composite results from CA + locked examination scores
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Results generated successfully.
 */
router.post(
    "/generate",
    authenticate,
    authorize(...writeRoles),
    resultValidator.generateResults,
    validate,
    audit("GENERATE", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.generateResults
);

/**
 * @swagger
 * /results/verify:
 *   post:
 *     summary: Verify generated results (Administrator / Headmaster / Registrar)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Results verified successfully.
 */
router.post(
    "/verify",
    authenticate,
    authorize(...verifyRoles),
    resultValidator.scopeAction,
    validate,
    audit("VERIFY", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.verifyResults
);

/**
 * @swagger
 * /results/unverify:
 *   post:
 *     summary: Unverify results (Administrator only)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Results unverified successfully.
 */
router.post(
    "/unverify",
    authenticate,
    authorize(...adminRoles),
    resultValidator.scopeAction,
    validate,
    audit("UNVERIFY", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.unverifyResults
);

/**
 * @swagger
 * /results/publish:
 *   post:
 *     summary: Publish verified results by ids or class/term scope
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Results published successfully.
 */
router.post(
    "/publish",
    authenticate,
    authorize(...writeRoles),
    resultValidator.scopeAction,
    validate,
    audit("PUBLISH", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.publishResults
);

/**
 * @swagger
 * /results/unpublish:
 *   post:
 *     summary: Unpublish results (Administrator only)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Results unpublished successfully.
 */
router.post(
    "/unpublish",
    authenticate,
    authorize(...adminRoles),
    resultValidator.scopeAction,
    validate,
    audit("UNPUBLISH", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.unpublishResults
);

/**
 * @swagger
 * /results/lock:
 *   post:
 *     summary: Lock results by ids or class/term scope
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Results locked successfully.
 */
router.post(
    "/lock",
    authenticate,
    authorize(...writeRoles),
    resultValidator.scopeAction,
    validate,
    audit("LOCK", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.lockResults
);

/**
 * @swagger
 * /results/unlock:
 *   post:
 *     summary: Unlock results (Administrator only)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Results unlocked successfully.
 */
router.post(
    "/unlock",
    authenticate,
    authorize(...adminRoles),
    resultValidator.scopeAction,
    validate,
    audit("UNLOCK", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.unlockResults
);

/**
 * @swagger
 * /results/recalculate-positions:
 *   post:
 *     summary: Recalculate subject and class positions for a class/term
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Positions recalculated successfully.
 */
router.post(
    "/recalculate-positions",
    authenticate,
    authorize(...writeRoles),
    resultValidator.recalculatePositions,
    validate,
    audit("RECALCULATE", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.recalculatePositions
);

/**
 * @swagger
 * /results:
 *   post:
 *     summary: Create a single result (manual)
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Result created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(...writeRoles),
    resultValidator.createResult,
    validate,
    audit("CREATE", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.createResult
);

/**
 * @swagger
 * /results/{id}:
 *   get:
 *     summary: Retrieve result by ID
 *     tags: [Results]
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
 *         description: Result retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(...readRoles),
    resultValidator.validateResultId,
    validate,
    resultController.getResultById
);

/**
 * @swagger
 * /results/{id}:
 *   put:
 *     summary: Update a result
 *     tags: [Results]
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
 *         description: Result updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    resultValidator.validateResultId,
    resultValidator.updateResult,
    validate,
    audit("UPDATE", "Results", {
        entityType: "Result",
        includeBody: true,
    }),
    resultController.updateResult
);

/**
 * @swagger
 * /results/{id}:
 *   delete:
 *     summary: Soft-archive a result
 *     tags: [Results]
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
 *         description: Result archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    resultValidator.validateResultId,
    validate,
    audit("ARCHIVE", "Results", {
        entityType: "Result",
    }),
    resultController.archiveResult
);

/**
 * @swagger
 * /results/{id}/restore:
 *   patch:
 *     summary: Restore an archived result
 *     tags: [Results]
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
 *         description: Result restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(...writeRoles),
    resultValidator.validateResultId,
    validate,
    audit("RESTORE", "Results", {
        entityType: "Result",
    }),
    resultController.restoreResult
);

module.exports = router;
