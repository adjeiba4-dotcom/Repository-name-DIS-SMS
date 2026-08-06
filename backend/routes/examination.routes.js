// routes/examination.routes.js

const express = require("express");
const router = express.Router();

const examinationController = require("../controllers/examination.controller");
const examinationValidator = require("../validators/examination.validator");

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

const adminRoles = [ROLES.ADMINISTRATOR];

/**
 * @swagger
 * tags:
 *   name: Examinations
 *   description: Examination Management APIs
 */

/**
 * @swagger
 * /examinations:
 *   get:
 *     summary: Retrieve examinations (paginated + search + filters)
 *     tags: [Examinations]
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
 *         name: examinationType
 *         schema:
 *           type: string
 *           enum: [MID_TERM, END_OF_TERM, MOCK, FINAL, ENTRANCE]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *       - in: query
 *         name: isLocked
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Examinations retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(...readRoles),
    examinationValidator.listExaminations,
    validate,
    examinationController.getExaminations
);

/**
 * @swagger
 * /examinations/archived:
 *   get:
 *     summary: Retrieve archived examinations
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived examinations retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(...readRoles),
    examinationValidator.listExaminations,
    validate,
    examinationController.getArchivedExaminations
);

/**
 * @swagger
 * /examinations/stats:
 *   get:
 *     summary: Retrieve examination statistics and analytics
 *     tags: [Examinations]
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
 *         description: Examination statistics retrieved successfully.
 */
router.get(
    "/stats",
    authenticate,
    authorize(...readRoles),
    examinationValidator.statsExaminations,
    validate,
    examinationController.getStats
);

/**
 * @swagger
 * /examinations:
 *   post:
 *     summary: Create an examination
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Examination created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(...writeRoles),
    examinationValidator.createExamination,
    validate,
    audit("CREATE", "Examinations", {
        entityType: "Examination",
        includeBody: true,
    }),
    examinationController.createExamination
);

/**
 * @swagger
 * /examinations/{id}/roster:
 *   get:
 *     summary: Retrieve examination score roster for enrolled students
 *     tags: [Examinations]
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
 *         description: Examination score roster retrieved successfully.
 */
router.get(
    "/:id/roster",
    authenticate,
    authorize(...readRoles),
    examinationValidator.validateExaminationId,
    validate,
    examinationController.getRoster
);

/**
 * @swagger
 * /examinations/{id}/scores/bulk:
 *   post:
 *     summary: Bulk upsert or clear examination scores
 *     tags: [Examinations]
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
 *         description: Examination scores processed successfully.
 */
router.post(
    "/:id/scores/bulk",
    authenticate,
    authorize(...writeRoles),
    examinationValidator.bulkScores,
    validate,
    audit("BULK_UPDATE", "Examinations", {
        entityType: "ExaminationScore",
        includeBody: true,
        recordIdResolver: (req) => Number(req.params.id),
    }),
    examinationController.bulkScores
);

/**
 * @swagger
 * /examinations/{id}/lock:
 *   patch:
 *     summary: Lock an examination
 *     tags: [Examinations]
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
 *         description: Examination locked successfully.
 */
router.patch(
    "/:id/lock",
    authenticate,
    authorize(...writeRoles),
    examinationValidator.validateExaminationId,
    validate,
    audit("LOCK", "Examinations", {
        entityType: "Examination",
        recordIdResolver: (req) => Number(req.params.id),
    }),
    examinationController.lockExamination
);

/**
 * @swagger
 * /examinations/{id}/unlock:
 *   patch:
 *     summary: Unlock an examination (administrators only)
 *     tags: [Examinations]
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
 *         description: Examination unlocked successfully.
 */
router.patch(
    "/:id/unlock",
    authenticate,
    authorize(...adminRoles),
    examinationValidator.validateExaminationId,
    validate,
    audit("UNLOCK", "Examinations", {
        entityType: "Examination",
        recordIdResolver: (req) => Number(req.params.id),
    }),
    examinationController.unlockExamination
);

/**
 * @swagger
 * /examinations/{id}/restore:
 *   patch:
 *     summary: Restore an archived examination
 *     tags: [Examinations]
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
 *         description: Examination restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(...writeRoles),
    examinationValidator.validateExaminationId,
    validate,
    audit("RESTORE", "Examinations", {
        entityType: "Examination",
        recordIdResolver: (req) => Number(req.params.id),
    }),
    examinationController.restoreExamination
);

/**
 * @swagger
 * /examinations/{id}:
 *   get:
 *     summary: Retrieve examination by ID
 *     tags: [Examinations]
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
 *         description: Examination retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(...readRoles),
    examinationValidator.validateExaminationId,
    validate,
    examinationController.getExaminationById
);

/**
 * @swagger
 * /examinations/{id}:
 *   put:
 *     summary: Update an examination
 *     tags: [Examinations]
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
 *         description: Examination updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    examinationValidator.updateExamination,
    validate,
    audit("UPDATE", "Examinations", {
        entityType: "Examination",
        includeBody: true,
    }),
    examinationController.updateExamination
);

/**
 * @swagger
 * /examinations/{id}:
 *   delete:
 *     summary: Archive an examination
 *     tags: [Examinations]
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
 *         description: Examination archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    examinationValidator.validateExaminationId,
    validate,
    audit("ARCHIVE", "Examinations", {
        entityType: "Examination",
        recordIdResolver: (req) => Number(req.params.id),
    }),
    examinationController.archiveExamination
);

module.exports = router;
