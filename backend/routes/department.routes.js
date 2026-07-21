const express = require("express");

const {
    getDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} = require("../controllers/department.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createDepartmentValidator,
    updateDepartmentValidator,
} = require("../validators/department.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Departments
 *     description: Department management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Mathematics
 *         code:
 *           type: string
 *           example: MATH
 *         description:
 *           type: string
 *           example: Mathematics Department
 *         status:
 *           type: string
 *           example: Active
 *
 *     CreateDepartmentRequest:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           example: Mathematics
 *         code:
 *           type: string
 *           example: MATH
 *         description:
 *           type: string
 *           example: Mathematics Department
 *
 *     UpdateDepartmentRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Retrieve all departments
 *     description: Returns a list of all academic departments.
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments retrieved successfully.
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
        ROLES.REGISTRAR
    ),
    getDepartments
);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Retrieve a department by ID
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department retrieved successfully.
 *       404:
 *         description: Department not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR
    ),
    getDepartmentById
);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     description: Creates a new academic department.
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDepartmentRequest'
 *     responses:
 *       201:
 *         description: Department created successfully.
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
    createDepartmentValidator,
    validate,
    createDepartment
);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update department information
 *     tags:
 *       - Departments
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
 *             $ref: '#/components/schemas/UpdateDepartmentRequest'
 *     responses:
 *       200:
 *         description: Department updated successfully.
 *       404:
 *         description: Department not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    updateDepartmentValidator,
    validate,
    updateDepartment
);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     description: Permanently removes a department.
 *     tags:
 *       - Departments
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
 *         description: Department deleted successfully.
 *       404:
 *         description: Department not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteDepartment
);

module.exports = router;