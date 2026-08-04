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
 *     summary: Retrieve terms (paginated + search)
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Terms retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termValidator.listTerms,
    validate,
    termController.getTerms
);

/**
 * @swagger
 * /terms:
 *   post:
 *     summary: Create a new academic term
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Term created successfully.
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
 * /terms/archived:
 *   get:
 *     summary: Retrieve archived terms
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
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Term retrieved successfully.
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
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
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
 * /terms/{id}/activate:
 *   patch:
 *     summary: Activate term
 *     description: Sets the term to ACTIVE and demotes any other active term.
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Term activated successfully.
 */
router.patch(
    "/:id/activate",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termValidator.validateTermId,
    validate,
    termController.activateTerm
);

/**
 * @swagger
 * /terms/{id}:
 *   delete:
 *     summary: Archive term
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
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
 *     tags: [Terms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Term restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    termValidator.restoreTerm,
    validate,
    termController.restoreTerm
);

module.exports = router;
