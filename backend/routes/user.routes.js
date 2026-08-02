// backend/routes/user.routes.js

const express = require("express");

const router = express.Router();

const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
    deleteUser,
    changePassword,
} = require("../controllers/user.controller");

const {
    createUser: createUserValidator,
    updateUser: updateUserValidator,
    changePassword: changePasswordValidator,
} = require("../validators/user.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User Management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         firstName:
 *           type: string
 *           example: Emmanuel
 *         lastName:
 *           type: string
 *           example: Baffour
 *         email:
 *           type: string
 *           format: email
 *           example: admin@dissms.edu.gh
 *         phone:
 *           type: string
 *           example: "+233241234567"
 *         username:
 *           type: string
 *           example: emmanuel
 *         role:
 *           type: string
 *           example: Administrator
 *         status:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - INACTIVE
 *           example: ACTIVE
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - username
 *         - email
 *         - password
 *         - role
 *       properties:
 *         firstName:
 *           type: string
 *           example: Emmanuel
 *         lastName:
 *           type: string
 *           example: Baffour
 *         username:
 *           type: string
 *           example: emmanuel
 *         email:
 *           type: string
 *           format: email
 *           example: admin@dissms.edu.gh
 *         phone:
 *           type: string
 *           example: "+233241234567"
 *         password:
 *           type: string
 *           format: password
 *           example: Password@123
 *         role:
 *           type: string
 *           example: Administrator
 *
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *         status:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - INACTIVE
 *
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           example: OldPassword@123
 *         newPassword:
 *           type: string
 *           format: password
 *           example: NewPassword@123
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     description: Returns a list of registered users.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    getUsers
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    createUserValidator,
    validate,
    createUser
);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     description: Returns the details of a specific user.
 *     tags:
 *       - Users
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
 *         description: User retrieved successfully.
 *       404:
 *         description: User not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user information
 *     description: Updates an existing user's profile information.
 *     tags:
 *       - Users
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
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: User not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    updateUserValidator,
    validate,
    updateUser
);

/**
 * @swagger
 * /users/{id}/activate:
 *   patch:
 *     summary: Activate a user
 *     description: Changes the user's status to ACTIVE.
 *     tags:
 *       - Users
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
 *         description: User activated successfully.
 *       404:
 *         description: User not found.
 */
router.patch(
    "/:id/activate",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    activateUser
);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     description: Changes the user's status to INACTIVE.
 *     tags:
 *       - Users
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
 *         description: User deactivated successfully.
 *       404:
 *         description: User not found.
 */
router.patch(
    "/:id/deactivate",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deactivateUser
);

/**
 * @swagger
 * /users/{id}/change-password:
 *   patch:
 *     summary: Change user password
 *     description: Updates the password for an existing user.
 *     tags:
 *       - Users
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
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: User not found.
 */
router.patch(
    "/:id/change-password",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    changePasswordValidator,
    validate,
    changePassword
);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete (Archive) a user
 *     description: Archives or permanently deletes a user depending on the system configuration.
 *     tags:
 *       - Users
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
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteUser
);

module.exports = router;