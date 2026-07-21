const express = require("express");

const {
    getEnrollments,
    getEnrollmentById,
    createEnrollment,
    updateEnrollment,
} = require("../controllers/enrollment.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createEnrollmentValidator,
    updateEnrollmentValidator,
} = require("../validators/enrollment.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Enrollments
 *     description: Student enrollment management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         studentId:
 *           type: integer
 *           example: 25
 *         classId:
 *           type: integer
 *           example: 4
 *         academicYearId:
 *           type: integer
 *           example: 2
 *         termId:
 *           type: integer
 *           example: 1
 *         enrollmentDate:
 *           type: string
 *           format: date
 *           example: 2026-09-02
 *         status:
 *           type: string
 *           example: Active
 *
 *     CreateEnrollmentRequest:
 *       type: object
 *       required:
 *         - studentId
 *         - classId
 *         - academicYearId
 *         - termId
 *       properties:
 *         studentId:
 *           type: integer
 *           example: 25
 *         classId:
 *           type: integer
 *           example: 4
 *         academicYearId:
 *           type: integer
 *           example: 2
 *         termId:
 *           type: integer
 *           example: 1
 *         enrollmentDate:
 *           type: string
 *           format: date
 *           example: 2026-09-02
 *
 *     UpdateEnrollmentRequest:
 *       type: object
 *       properties:
 *         classId:
 *           type: integer
 *         academicYearId:
 *           type: integer
 *         termId:
 *           type: integer
 *         enrollmentDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /enrollments:
 *   get:
 *     summary: Retrieve all enrollments
 *     description: Returns all student enrollment records.
 *     tags:
 *       - Enrollments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully.
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
    getEnrollments
);

/**
 * @swagger
 * /enrollments/{id}:
 *   get:
 *     summary: Retrieve an enrollment by ID
 *     tags:
 *       - Enrollments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment retrieved successfully.
 *       404:
 *         description: Enrollment not found.
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
    getEnrollmentById
);

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll a student
 *     description: Creates a new student enrollment.
 *     tags:
 *       - Enrollments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEnrollmentRequest'
 *     responses:
 *       201:
 *         description: Student enrolled successfully.
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
    createEnrollmentValidator,
    validate,
    createEnrollment
);

/**
 * @swagger
 * /enrollments/{id}:
 *   put:
 *     summary: Update an enrollment
 *     tags:
 *       - Enrollments
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
 *             $ref: '#/components/schemas/UpdateEnrollmentRequest'
 *     responses:
 *       200:
 *         description: Enrollment updated successfully.
 *       404:
 *         description: Enrollment not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.REGISTRAR
    ),
    updateEnrollmentValidator,
    validate,
    updateEnrollment
);

module.exports = router;