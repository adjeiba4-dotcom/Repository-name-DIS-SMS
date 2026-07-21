const express = require("express");

const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
} = require("../controllers/student.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createStudentValidator,
    updateStudentValidator,
} = require("../validators/student.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Students
 *     description: Student management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         studentNumber:
 *           type: string
 *           example: DIS2026001
 *         firstName:
 *           type: string
 *           example: Kwame
 *         lastName:
 *           type: string
 *           example: Mensah
 *         gender:
 *           type: string
 *           example: Male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: 2010-05-15
 *         email:
 *           type: string
 *           format: email
 *           example: kwame.mensah@student.dissms.edu.gh
 *         phone:
 *           type: string
 *           example: +233241234567
 *         status:
 *           type: string
 *           example: Active
 *
 *     CreateStudentRequest:
 *       type: object
 *       required:
 *         - studentNumber
 *         - firstName
 *         - lastName
 *       properties:
 *         studentNumber:
 *           type: string
 *           example: DIS2026001
 *         firstName:
 *           type: string
 *           example: Kwame
 *         lastName:
 *           type: string
 *           example: Mensah
 *         gender:
 *           type: string
 *           example: Male
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: 2010-05-15
 *         email:
 *           type: string
 *           format: email
 *           example: kwame.mensah@student.dissms.edu.gh
 *         phone:
 *           type: string
 *           example: +233241234567
 *
 *     UpdateStudentRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         gender:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Retrieve all students
 *     description: Returns a list of all students.
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully.
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
    getStudents
);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Retrieve a student by ID
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student retrieved successfully.
 *       404:
 *         description: Student not found.
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
    getStudentById
);

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Register a new student
 *     description: Creates a new student record.
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentRequest'
 *     responses:
 *       201:
 *         description: Student created successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.REGISTRAR
    ),
    createStudentValidator,
    validate,
    createStudent
);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update student information
 *     tags:
 *       - Students
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
 *             $ref: '#/components/schemas/UpdateStudentRequest'
 *     responses:
 *       200:
 *         description: Student updated successfully.
 *       404:
 *         description: Student not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.REGISTRAR
    ),
    updateStudentValidator,
    validate,
    updateStudent
);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     description: Permanently removes a student record.
 *     tags:
 *       - Students
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
 *         description: Student deleted successfully.
 *       404:
 *         description: Student not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteStudent
);

module.exports = router;