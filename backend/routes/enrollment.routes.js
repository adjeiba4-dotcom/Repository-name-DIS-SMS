// routes/enrollment.routes.js

const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollment.controller");

const enrollmentValidator = require("../validators/enrollment.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const {
    validate,
} = require("../middleware/validation.middleware");

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
 *     summary: Retrieve all enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    enrollmentController.getEnrollments
);

/**
 * @swagger
 * /enrollments/search:
 *   get:
 *     summary: Search enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search completed successfully
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    enrollmentValidator.searchEnrollment,
    validate,
    enrollmentController.searchEnrollments
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
 *         description: Enrollment retrieved successfully
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    enrollmentValidator.validateEnrollmentId,
    validate,
    enrollmentController.getEnrollmentById
);

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll a student
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    enrollmentValidator.createEnrollment,
    validate,
    enrollmentController.createEnrollment
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
 *         description: Enrollment updated successfully
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    enrollmentValidator.validateEnrollmentId,
    enrollmentValidator.updateEnrollment,
    validate,
    enrollmentController.updateEnrollment
);

/**
 * @swagger
 * /enrollments/{id}:
 *   delete:
 *     summary: Delete enrollment
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
 *         description: Enrollment deleted successfully
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    enrollmentValidator.validateEnrollmentId,
    validate,
    enrollmentController.deleteEnrollment
);

module.exports = router;