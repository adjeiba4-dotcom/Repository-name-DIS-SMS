// routes/academicYear.routes.js

const express = require("express");
const router = express.Router();

const academicYearController = require("../controllers/academicYear.controller");
const academicYearValidator = require("../validators/academicYear.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Academic Years
 *   description: Academic Year Management APIs
 */

/**
 * @swagger
 * /academic-years:
 *   get:
 *     summary: Retrieve academic years (paginated + search)
 *     tags: [Academic Years]
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
 *     responses:
 *       200:
 *         description: Academic years retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearValidator.listAcademicYears,
    validate,
    academicYearController.getAcademicYears
);

/**
 * @swagger
 * /academic-years:
 *   post:
 *     summary: Create a new academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Academic year created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearValidator.createAcademicYear,
    validate,
    academicYearController.createAcademicYear
);

/**
 * @swagger
 * /academic-years/archived:
 *   get:
 *     summary: Retrieve archived academic years
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived academic years retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearController.getArchivedAcademicYears
);

/**
 * @swagger
 * /academic-years/{id}:
 *   get:
 *     summary: Retrieve academic year by ID
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic year retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearValidator.validateAcademicYearId,
    validate,
    academicYearController.getAcademicYearById
);

/**
 * @swagger
 * /academic-years/{id}:
 *   put:
 *     summary: Update academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic year updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearValidator.updateAcademicYear,
    validate,
    academicYearController.updateAcademicYear
);

/**
 * @swagger
 * /academic-years/{id}:
 *   delete:
 *     summary: Archive academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic year archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearValidator.validateAcademicYearId,
    validate,
    academicYearController.deleteAcademicYear
);

/**
 * @swagger
 * /academic-years/{id}/restore:
 *   patch:
 *     summary: Restore archived academic year
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic year restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearValidator.restoreAcademicYear,
    validate,
    academicYearController.restoreAcademicYear
);

module.exports = router;
