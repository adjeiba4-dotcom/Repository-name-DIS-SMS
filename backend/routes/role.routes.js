const express = require("express");

const {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
} = require("../controllers/role.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createRoleValidator,
    updateRoleValidator,
} = require("../validators/role.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: Role management APIs
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
 *           example: System administrator role
 *         status:
 *           type: string
 *           example: ACTIVE
 *
 *     CreateRoleRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Administrator
 *         description:
 *           type: string
 *           example: System administrator role
 *
 *     UpdateRoleRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Retrieve all roles
 *     description: Returns a list of all roles.
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
    getRoles
);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Retrieve a role by ID
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
 *         description: Role retrieved successfully.
 *       404:
 *         description: Role not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    getRoleById
);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     description: Creates a new role.
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
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    createRoleValidator,
    validate,
    createRole
);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update role
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleRequest'
 *     responses:
 *       200:
 *         description: Role updated successfully.
 *       404:
 *         description: Role not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    updateRoleValidator,
    validate,
    updateRole
);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Archive role
 *     description: Archives an existing role.
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
 *         description: Role archived successfully.
 *       404:
 *         description: Role not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteRole
);

module.exports = router;