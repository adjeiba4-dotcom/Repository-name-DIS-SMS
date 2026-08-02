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
 *     summary: Retrieve all academic years
 *     description: Returns all active academic years.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic years retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearController.getAcademicYears
);

/**
 * @swagger
 * /academic-years:
 *   post:
 *     summary: Create a new academic year
 *     description: Creates a new academic year.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: 2026/2027 Academic Year
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-09-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2027-07-31
 *               isCurrent:
 *                 type: boolean
 *                 example: true
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
 * /academic-years/search:
 *   get:
 *     summary: Search academic years
 *     description: Search academic years by name.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         example: 2026
 *     responses:
 *       200:
 *         description: Academic years retrieved successfully.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearValidator.searchAcademicYear,
    validate,
    academicYearController.searchAcademicYears
);

/**
 * @swagger
 * /academic-years/archived:
 *   get:
 *     summary: Retrieve archived academic years
 *     description: Returns all archived academic years.
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
 *     description: Returns an academic year using its ID.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
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
 *     description: Updates an existing academic year.
 *     tags: [Academic Years]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 2026/2027 Academic Year
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isCurrent:
 *                 type: boolean
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
 *     description: Soft deletes an academic year.
 *     tags: [Academic Years]
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
 *     description: Restores a previously archived academic year.
 *     tags: [Academic Years]
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
 *         description: Academic year restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    academicYearValidator.validateAcademicYearId,
    validate,
    academicYearController.restoreAcademicYear
);

module.exports = router;