const express = require("express");

const {
    getTerms,
    getTermById,
    createTerm,
    updateTerm,
    deleteTerm,
} = require("../controllers/term.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createTermValidator,
    updateTermValidator,
} = require("../validators/term.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Terms
 *     description: Academic term management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Term:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: First Term
 *         academicYear:
 *           type: string
 *           example: 2026/2027
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2026-09-01
 *         endDate:
 *           type: string
 *           format: date
 *           example: 2026-12-18
 *         status:
 *           type: string
 *           example: Active
 *
 *     CreateTermRequest:
 *       type: object
 *       required:
 *         - name
 *         - academicYear
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *           example: First Term
 *         academicYear:
 *           type: string
 *           example: 2026/2027
 *         startDate:
 *           type: string
 *           format: date
 *           example: 2026-09-01
 *         endDate:
 *           type: string
 *           format: date
 *           example: 2026-12-18
 *
 *     UpdateTermRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         academicYear:
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
 * /terms:
 *   get:
 *     summary: Retrieve all academic terms
 *     description: Returns a list of all academic terms.
 *     tags:
 *       - Terms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Terms retrieved successfully.
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
    getTerms
);

/**
 * @swagger
 * /terms/{id}:
 *   get:
 *     summary: Retrieve a term by ID
 *     tags:
 *       - Terms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Term ID
 *     responses:
 *       200:
 *         description: Term retrieved successfully.
 *       404:
 *         description: Term not found.
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
    getTermById
);

/**
 * @swagger
 * /terms:
 *   post:
 *     summary: Create a new academic term
 *     description: Creates a new academic term.
 *     tags:
 *       - Terms
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTermRequest'
 *     responses:
 *       201:
 *         description: Term created successfully.
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
    createTermValidator,
    validate,
    createTerm
);

/**
 * @swagger
 * /terms/{id}:
 *   put:
 *     summary: Update an academic term
 *     tags:
 *       - Terms
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
 *             $ref: '#/components/schemas/UpdateTermRequest'
 *     responses:
 *       200:
 *         description: Term updated successfully.
 *       404:
 *         description: Term not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    updateTermValidator,
    validate,
    updateTerm
);

/**
 * @swagger
 * /terms/{id}:
 *   delete:
 *     summary: Delete an academic term
 *     description: Permanently removes an academic term.
 *     tags:
 *       - Terms
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
 *         description: Term deleted successfully.
 *       404:
 *         description: Term not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteTerm
);

module.exports = router;