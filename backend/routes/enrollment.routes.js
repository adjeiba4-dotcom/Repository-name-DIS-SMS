// routes/enrollment.routes.js

const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollment.controller");
const enrollmentValidator = require("../validators/enrollment.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Student Enrollment Management APIs
 */

/**
 * @swagger
 * /enrollments:
 *   get:
 *     summary: Retrieve enrollments (paginated + search + filters)
 *     tags: [Enrollments]
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
 *         name: studentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: schoolClassId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: termId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    enrollmentValidator.listEnrollments,
    validate,
    enrollmentController.getEnrollments
);

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll a student
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - schoolClassId
 *               - academicYearId
 *             properties:
 *               studentId:
 *                 type: integer
 *               schoolClassId:
 *                 type: integer
 *               academicYearId:
 *                 type: integer
 *               termId:
 *                 type: integer
 *                 nullable: true
 *               enrollmentDate:
 *                 type: string
 *                 format: date-time
 *               remarks:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       201:
 *         description: Enrollment created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    enrollmentValidator.createEnrollment,
    validate,
    enrollmentController.createEnrollment
);

/**
 * @swagger
 * /enrollments/archived:
 *   get:
 *     summary: Retrieve archived enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived enrollments retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    enrollmentController.getArchivedEnrollments
);

/**
 * @swagger
 * /enrollments/{id}:
 *   get:
 *     summary: Retrieve enrollment by ID
 *     tags: [Enrollments]
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
 *         description: Enrollment retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    enrollmentValidator.validateEnrollmentId,
    validate,
    enrollmentController.getEnrollmentById
);

/**
 * @swagger
 * /enrollments/{id}:
 *   put:
 *     summary: Update enrollment
 *     tags: [Enrollments]
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
 *         description: Enrollment updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    enrollmentValidator.updateEnrollment,
    validate,
    enrollmentController.updateEnrollment
);

/**
 * @swagger
 * /enrollments/{id}:
 *   delete:
 *     summary: Archive enrollment
 *     tags: [Enrollments]
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
 *         description: Enrollment archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    enrollmentValidator.validateEnrollmentId,
    validate,
    enrollmentController.deleteEnrollment
);

/**
 * @swagger
 * /enrollments/{id}/restore:
 *   patch:
 *     summary: Restore archived enrollment
 *     tags: [Enrollments]
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
 *         description: Enrollment restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    enrollmentValidator.restoreEnrollment,
    validate,
    enrollmentController.restoreEnrollment
);

module.exports = router;
