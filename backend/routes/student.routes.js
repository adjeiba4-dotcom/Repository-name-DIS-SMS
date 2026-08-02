// backend/routes/student.routes.js

const express = require("express");

const router = express.Router();

const studentController = require("../controllers/student.controller");

const {
    createStudent,
    updateStudent,
    validateStudentId,
    searchStudent,
} = require("../validators/student.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * -----------------------------------------------------
 * Swagger Tags
 * -----------------------------------------------------
 */

/**
 * @swagger
 * tags:
 *   - name: Students
 *     description: Student Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *
 *         admissionNo:
 *           type: string
 *           example: DIS2026001
 *
 *         firstName:
 *           type: string
 *           example: Kwame
 *
 *         lastName:
 *           type: string
 *           example: Mensah
 *
 *         otherName:
 *           type: string
 *           example: Kofi
 *
 *         gender:
 *           type: string
 *           enum:
 *             - MALE
 *             - FEMALE
 *
 *         dateOfBirth:
 *           type: string
 *           format: date
 *
 *         admissionDate:
 *           type: string
 *           format: date
 *
 *         guardianId:
 *           type: integer
 *           example: 3
 *
 *         classId:
 *           type: integer
 *           example: 8
 *
 *         email:
 *           type: string
 *
 *         phone:
 *           type: string
 *
 *         address:
 *           type: string
 *
 *         status:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - INACTIVE
 *             - ARCHIVED
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Retrieve all students
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR
    ),
    studentController.getStudents
);

/**
 * @swagger
 * /students/search:
 *   get:
 *     summary: Search students
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/search",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR
    ),
    searchStudent,
    validate,
    studentController.searchStudents
);

/**
 * @swagger
 * /students/archived:
 *   get:
 *     summary: Retrieve archived students
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/archived",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR
    ),
    studentController.getArchivedStudents
);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Retrieve student by ID
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
 */
router.get(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR
    ),
    validateStudentId,
    validate,
    studentController.getStudentById
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
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    createStudent,
    validate,
    studentController.createStudent
);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update student
 *     description: Updates an existing student's information.
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
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated successfully.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Student not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateStudentId,
    updateStudent,
    validate,
    studentController.updateStudent
);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Archive student
 *     description: Soft deletes (archives) a student.
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
 *         description: Student archived successfully.
 *       404:
 *         description: Student not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateStudentId,
    validate,
    studentController.deleteStudent
);

/**
 * @swagger
 * /students/{id}/restore:
 *   patch:
 *     summary: Restore archived student
 *     description: Restores an archived student.
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
 *         description: Student restored successfully.
 *       404:
 *         description: Archived student not found.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateStudentId,
    validate,
    studentController.restoreStudent
);

module.exports = router;