const express = require("express");

const { login } = require("../controllers/auth.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const {
    loginValidator,
} = require("../validators/auth.validator");

const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Authentication and user profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@dissms.edu.gh
 *         password:
 *           type: string
 *           format: password
 *           example: Password@123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful.
 *         token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         fullName:
 *           type: string
 *           example: Emmanuel Adjei Baffour
 *         email:
 *           type: string
 *           example: admin@dissms.edu.gh
 *         role:
 *           type: string
 *           example: ADMINISTRATOR
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login into DIS-SMS
 *     description: Authenticates a registered user and returns an access token.
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid email or password.
 *       500:
 *         description: Internal server error.
 */
router.post(
    "/login",
    loginValidator,
    validate,
    login
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get logged-in user's profile
 *     description: Returns the authenticated user's profile information.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile retrieved successfully.
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
    "/profile",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR,
        ROLES.ACCOUNTANT,
        ROLES.TEACHER,
        ROLES.STUDENT,
        ROLES.PARENT
    ),
    (req, res) => {
        res.json({
            success: true,
            message: "Profile retrieved successfully.",
            data: req.user,
        });
    }
);

module.exports = router;