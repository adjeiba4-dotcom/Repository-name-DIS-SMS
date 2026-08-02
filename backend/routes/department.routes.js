const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/department.controller");
const departmentValidator = require("../validators/department.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department Management APIs
 */

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Retrieve all departments
 *     description: Returns all active departments.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    departmentController.getDepartments
);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     description: Creates a new academic department.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *                 example: SCI
 *               name:
 *                 type: string
 *                 example: Science Department
 *               description:
 *                 type: string
 *                 example: Handles all science-related subjects.
 *     responses:
 *       201:
 *         description: Department created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       409:
 *         description: Department already exists.
 *       500:
 *         description: Internal server error.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    departmentValidator.createDepartment,
    validate,
    departmentController.createDepartment
);

/**
 * @swagger
 * /departments/search:
 *   get:
 *     summary: Search departments
 *     description: Search departments by code or name.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         example: Science
 *     responses:
 *       200:
 *         description: Departments retrieved successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    departmentValidator.searchDepartment,
    validate,
    departmentController.searchDepartments
);

/**
 * @swagger
 * /departments/archived:
 *   get:
 *     summary: Retrieve archived departments
 *     description: Returns all archived departments.
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived departments retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    departmentController.getArchivedDepartments
);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Retrieve department by ID
 *     description: Returns one department using its ID.
 *     tags: [Departments]
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
 *         description: Department retrieved successfully.
 *       400:
 *         description: Invalid department ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Department not found.
 *       500:
 *         description: Internal server error.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    departmentValidator.validateDepartmentId,
    validate,
    departmentController.getDepartmentById
);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update department
 *     description: Updates an existing department.
 *     tags: [Departments]
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
 *               code:
 *                 type: string
 *                 example: SCI
 *               name:
 *                 type: string
 *                 example: Science Department
 *               description:
 *                 type: string
 *                 example: Updated department description.
 *     responses:
 *       200:
 *         description: Department updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Department not found.
 *       500:
 *         description: Internal server error.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    departmentValidator.updateDepartment,
    validate,
    departmentController.updateDepartment
);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Archive department
 *     description: Soft deletes a department.
 *     tags: [Departments]
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
 *         description: Department archived successfully.
 *       400:
 *         description: Invalid department ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Department not found.
 *       500:
 *         description: Internal server error.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    departmentValidator.validateDepartmentId,
    validate,
    departmentController.deleteDepartment
);

/**
 * @swagger
 * /departments/{id}/restore:
 *   patch:
 *     summary: Restore archived department
 *     description: Restores a previously archived department.
 *     tags: [Departments]
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
 *         description: Department restored successfully.
 *       400:
 *         description: Invalid department ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Department not found.
 *       500:
 *         description: Internal server error.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    departmentValidator.validateDepartmentId,
    validate,
    departmentController.restoreDepartment
);

module.exports = router;