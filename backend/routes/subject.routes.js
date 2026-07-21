const express = require("express");

const {
    getSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
} = require("../controllers/subject.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createSubjectValidator,
    updateSubjectValidator,
} = require("../validators/subject.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Subjects
 *     description: Subject management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Subject:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         subjectCode:
 *           type: string
 *           example: MATH101
 *         subjectName:
 *           type: string
 *           example: Mathematics
 *         department:
 *           type: string
 *           example: Science
 *         creditHours:
 *           type: integer
 *           example: 4
 *         status:
 *           type: string
 *           example: Active
 *
 *     CreateSubjectRequest:
 *       type: object
 *       required:
 *         - subjectCode
 *         - subjectName
 *       properties:
 *         subjectCode:
 *           type: string
 *           example: MATH101
 *         subjectName:
 *           type: string
 *           example: Mathematics
 *         department:
 *           type: string
 *           example: Science
 *         creditHours:
 *           type: integer
 *           example: 4
 *
 *     UpdateSubjectRequest:
 *       type: object
 *       properties:
 *         subjectCode:
 *           type: string
 *         subjectName:
 *           type: string
 *         department:
 *           type: string
 *         creditHours:
 *           type: integer
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Retrieve all subjects
 *     description: Returns a list of all school subjects.
 *     tags:
 *       - Subjects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully.
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
    getSubjects
);

/**
 * @swagger
 * /subjects/{id}:
 *   get:
 *     summary: Retrieve a subject by ID
 *     tags:
 *       - Subjects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject retrieved successfully.
 *       404:
 *         description: Subject not found.
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
    getSubjectById
);

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Create a new subject
 *     description: Creates a new academic subject.
 *     tags:
 *       - Subjects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubjectRequest'
 *     responses:
 *       201:
 *         description: Subject created successfully.
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
    createSubjectValidator,
    validate,
    createSubject
);

/**
 * @swagger
 * /subjects/{id}:
 *   put:
 *     summary: Update subject information
 *     tags:
 *       - Subjects
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
 *             $ref: '#/components/schemas/UpdateSubjectRequest'
 *     responses:
 *       200:
 *         description: Subject updated successfully.
 *       404:
 *         description: Subject not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR
    ),
    updateSubjectValidator,
    validate,
    updateSubject
);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     summary: Delete a subject
 *     description: Permanently removes a subject.
 *     tags:
 *       - Subjects
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
 *         description: Subject deleted successfully.
 *       404:
 *         description: Subject not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteSubject
);

module.exports = router;