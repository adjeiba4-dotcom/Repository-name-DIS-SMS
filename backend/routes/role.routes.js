// backend/routes/role.routes.js

const express = require("express");

const router = express.Router();

const roleController = require("../controllers/role.controller");
const roleValidator = require("../validators/role.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: Role and Permission Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Administrator
 *         description:
 *           type: string
 *           example: Full access to the entire system.
 *         status:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - INACTIVE
 *             - ARCHIVED
 *           example: ACTIVE
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateRoleRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Accountant
 *         description:
 *           type: string
 *           example: Responsible for school financial management.
 *
 *     UpdateRoleRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Senior Accountant
 *         description:
 *           type: string
 *           example: Oversees accounting operations and financial reporting.
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Retrieve all roles
 *     description: Returns all active system roles.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    roleController.getRoles
);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Retrieve a role by ID
 *     description: Returns details of a specific role.
 *     tags:
 *       - Roles
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
 *         description: Role retrieved successfully.
 *       404:
 *         description: Role not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    roleController.getRoleById
);
/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     description: Creates a new role in the system.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleRequest'
 *     responses:
 *       201:
 *         description: Role created successfully.
 *       400:
 *         description: Validation error.
 *       409:
 *         description: Role already exists.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    roleValidator.createRole,
    validate,
    roleController.createRole
);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update role information
 *     description: Updates an existing system role.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Role not found.
 *       409:
 *         description: Role already exists.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    roleValidator.updateRole,
    validate,
    roleController.updateRole
);
/**
 * @swagger
 * /roles/{id}/activate:
 *   patch:
 *     summary: Activate a role
 *     description: Changes the role status to ACTIVE.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role activated successfully.
 *       404:
 *         description: Role not found.
 */
router.patch(
    "/:id/activate",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    roleController.activateRole
);

/**
 * @swagger
 * /roles/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a role
 *     description: Changes the role status to INACTIVE.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deactivated successfully.
 *       404:
 *         description: Role not found.
 */
router.patch(
    "/:id/deactivate",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    roleController.deactivateRole
);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete (Archive) a role
 *     description: Soft deletes a role by marking it as archived.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully.
 *       404:
 *         description: Role not found.
 *       409:
 *         description: Role is assigned to one or more users.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    roleController.deleteRole
);

module.exports = router;