const express = require("express");

const {
    getExaminations,
    getExaminationById,
    createExamination,
    updateExamination,
    deleteExamination,
} = require("../controllers/examination.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createExaminationValidator,
    updateExaminationValidator,
} = require("../validators/examination.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Examinations
 *     description: Examination management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Examination:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Mid-Term Examination
 *         subjectId:
 *           type: integer
 *           example: 5
 *         classId:
 *           type: integer
 *           example: 3
 *         academicYearId:
 *           type: integer
 *           example: 2
 *         termId:
 *           type: integer
 *           example: 1
 *         examinationDate:
 *           type: string
 *           format: date
 *           example: 2026-10-20
 *         totalMarks:
 *           type: integer
 *           example: 100
 *         status:
 *           type: string
 *           example: Scheduled
 *
 *     CreateExaminationRequest:
 *       type: object
 *       required:
 *         - title
 *         - subjectId
 *         - classId
 *         - academicYearId
 *         - termId
 *         - examinationDate
 *         - totalMarks
 *       properties:
 *         title:
 *           type: string
 *           example: Mid-Term Examination
 *         subjectId:
 *           type: integer
 *           example: 5
 *         classId:
 *           type: integer
 *           example: 3
 *         academicYearId:
 *           type: integer
 *           example: 2
 *         termId:
 *           type: integer
 *           example: 1
 *         examinationDate:
 *           type: string
 *           format: date
 *           example: 2026-10-20
 *         totalMarks:
 *           type: integer
 *           example: 100
 *
 *     UpdateExaminationRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         subjectId:
 *           type: integer
 *         classId:
 *           type: integer
 *         academicYearId:
 *           type: integer
 *         termId:
 *           type: integer
 *         examinationDate:
 *           type: string
 *           format: date
 *         totalMarks:
 *           type: integer
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /examinations:
 *   get:
 *     summary: Retrieve all examinations
 *     description: Returns a list of all examinations.
 *     tags:
 *       - Examinations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Examinations retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR,
        ROLES.TEACHER
    ),
    getExaminations
);

/**
 * @swagger
 * /examinations/{id}:
 *   get:
 *     summary: Retrieve an examination by ID
 *     tags:
 *       - Examinations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Examination ID
 *     responses:
 *       200:
 *         description: Examination retrieved successfully.
 *       404:
 *         description: Examination not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR,
        ROLES.TEACHER
    ),
    getExaminationById
);

/**
 * @swagger
 * /examinations:
 *   post:
 *     summary: Create a new examination
 *     description: Creates a new examination schedule.
 *     tags:
 *       - Examinations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExaminationRequest'
 *     responses:
 *       201:
 *         description: Examination created successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR
    ),
    createExaminationValidator,
    validate,
    createExamination
);

/**
 * @swagger
 * /examinations/{id}:
 *   put:
 *     summary: Update an examination
 *     tags:
 *       - Examinations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExaminationRequest'
 *     responses:
 *       200:
 *         description: Examination updated successfully.
 *       404:
 *         description: Examination not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR
    ),
    updateExaminationValidator,
    validate,
    updateExamination
);

/**
 * @swagger
 * /examinations/{id}:
 *   delete:
 *     summary: Delete an examination
 *     description: Permanently removes an examination.
 *     tags:
 *       - Examinations
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
 *         description: Examination deleted successfully.
 *       404:
 *         description: Examination not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteExamination
);

module.exports = router;