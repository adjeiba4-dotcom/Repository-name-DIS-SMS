// routes/result.routes.js

const express = require("express");
const router = express.Router();

const resultController = require("../controllers/result.controller");

const resultValidator = require("../validators/result.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const {
    validate,
} = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Results
 *   description: Student Result Management APIs
 */

/**
 * @swagger
 * /results:
 *   get:
 *     summary: Retrieve all results
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Results retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    resultController.getResults
);

/**
 * @swagger
 * /results/search:
 *   get:
 *     summary: Search results
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search by student, examination, subject, grade or term
 *     responses:
 *       200:
 *         description: Result search completed successfully.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    resultValidator.searchResults,
    validate,
    resultController.searchResults
);

/**
 * @swagger
 * /results/{id}:
 *   get:
 *     summary: Retrieve result by ID
 *     tags: [Results]
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
 *         description: Result retrieved successfully.
 *       404:
 *         description: Result not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    resultValidator.validateResultId,
    validate,
    resultController.getResultById
);

/**
 * @swagger
 * /results:
 *   post:
 *     summary: Create student result
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Result created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    resultValidator.createResult,
    validate,
    resultController.createResult
);

/**
 * @swagger
 * /results/{id}:
 *   put:
 *     summary: Update student result
 *     tags: [Results]
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
 *         description: Result updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    resultValidator.validateResultId,
    resultValidator.updateResult,
    validate,
    resultController.updateResult
);

/**
 * @swagger
 * /results/{id}:
 *   delete:
 *     summary: Delete student result
 *     tags: [Results]
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
 *         description: Result deleted successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    resultValidator.validateResultId,
    validate,
    resultController.deleteResult
);

module.exports = router;