// routes/term.routes.js

const express = require("express");
const router = express.Router();

const termController = require("../controllers/term.controller");
const termValidator = require("../validators/term.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Terms
 *   description: Academic Term Management APIs
 */

/**
 * @swagger
 * /terms:
 *   get:
 *     summary: Retrieve all terms
 *     description: Returns all active academic terms.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Terms retrieved successfully.
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
    termController.getTerms
);

/**
 * @swagger
 * /terms:
 *   post:
 *     summary: Create a new academic term
 *     description: Creates a new academic term under an academic year.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academicYearId
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               academicYearId:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: First Term
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-09-01
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-20
 *               isCurrent:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: string
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Term created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       409:
 *         description: Duplicate term.
 *       500:
 *         description: Internal server error.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termValidator.createTerm,
    validate,
    termController.createTerm
);

/**
 * @swagger
 * /terms/search:
 *   get:
 *     summary: Search terms
 *     description: Search terms by name.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         example: First
 *     responses:
 *       200:
 *         description: Search completed successfully.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termValidator.searchTerm,
    validate,
    termController.searchTerms
);

/**
 * @swagger
 * /terms/archived:
 *   get:
 *     summary: Retrieve archived terms
 *     description: Returns all archived terms.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived terms retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termController.getArchivedTerms
);

/**
 * @swagger
 * /terms/{id}:
 *   get:
 *     summary: Retrieve term by ID
 *     description: Returns a single academic term.
 *     tags: [Terms]
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
 *         description: Term retrieved successfully.
 *       404:
 *         description: Term not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termValidator.validateTermId,
    validate,
    termController.getTermById
);

/**
 * @swagger
 * /terms/{id}:
 *   put:
 *     summary: Update term
 *     description: Updates an academic term.
 *     tags: [Terms]
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
 *         description: Term updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termValidator.updateTerm,
    validate,
    termController.updateTerm
);

/**
 * @swagger
 * /terms/{id}:
 *   delete:
 *     summary: Archive term
 *     description: Soft deletes a term.
 *     tags: [Terms]
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
 *         description: Term archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termValidator.validateTermId,
    validate,
    termController.deleteTerm
);

/**
 * @swagger
 * /terms/{id}/restore:
 *   patch:
 *     summary: Restore archived term
 *     description: Restores a previously archived term.
 *     tags: [Terms]
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
 *         description: Term restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termValidator.validateTermId,
    validate,
    termController.restoreTerm
);

module.exports = router;