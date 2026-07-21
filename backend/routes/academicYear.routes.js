const express = require("express");

const {
    getAcademicYears,
    getAcademicYearById,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
} = require("../controllers/academicYear.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createAcademicYearValidator,
    updateAcademicYearValidator,
} = require("../validators/academicYear.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Academic Years
 *     description: Academic year management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AcademicYear:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: 2026/2027
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2026-09-01
 *         endDate:
 *           type: string
 *           format: date
 *           example: 2027-07-31
 *         status:
 *           type: string
 *           example: Active
 *
 *     CreateAcademicYearRequest:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *           example: 2026/2027
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2026-09-01
 *         endDate:
 *           type: string
 *           format: date
 *           example: 2027-07-31
 *
 *     UpdateAcademicYearRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /academic-years:
 *   get:
 *     summary: Retrieve all academic years
 *     description: Returns a list of all academic years.
 *     tags:
 *       - Academic Years
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic years retrieved successfully.
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
    getAcademicYears
);

/**
 * @swagger
 * /academic-years/{id}:
 *   get:
 *     summary: Retrieve an academic year by ID
 *     tags:
 *       - Academic Years
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Academic Year ID
 *     responses:
 *       200:
 *         description: Academic year retrieved successfully.
 *       404:
 *         description: Academic year not found.
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
    getAcademicYearById
);

/**
 * @swagger
 * /academic-years:
 *   post:
 *     summary: Create a new academic year
 *     description: Creates a new academic year.
 *     tags:
 *       - Academic Years
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAcademicYearRequest'
 *     responses:
 *       201:
 *         description: Academic year created successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    createAcademicYearValidator,
    validate,
    createAcademicYear
);

/**
 * @swagger
 * /academic-years/{id}:
 *   put:
 *     summary: Update an academic year
 *     tags:
 *       - Academic Years
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
 *             $ref: '#/components/schemas/UpdateAcademicYearRequest'
 *     responses:
 *       200:
 *         description: Academic year updated successfully.
 *       404:
 *         description: Academic year not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    updateAcademicYearValidator,
    validate,
    updateAcademicYear
);

/**
 * @swagger
 * /academic-years/{id}:
 *   delete:
 *     summary: Delete an academic year
 *     description: Permanently removes an academic year.
 *     tags:
 *       - Academic Years
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
 *         description: Academic year deleted successfully.
 *       404:
 *         description: Academic year not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteAcademicYear
);

module.exports = router;