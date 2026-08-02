const express = require("express");
const router = express.Router();

const classController = require("../controllers/class.controller");
const classValidator = require("../validators/class.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: School Class Management APIs
 */

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Retrieve all classes
 *     description: Returns all active classes.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classes retrieved successfully.
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
    classController.getClasses
);

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new class
 *     description: Creates a new school class.
 *     tags: [Classes]
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
 *                 example: SHS1A
 *               name:
 *                 type: string
 *                 example: SHS 1 Science A
 *               level:
 *                 type: string
 *                 example: Senior High
 *               capacity:
 *                 type: integer
 *                 example: 50
 *               description:
 *                 type: string
 *                 example: First year Science class.
 *     responses:
 *       201:
 *         description: Class created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       409:
 *         description: Class already exists.
 *       500:
 *         description: Internal server error.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classValidator.createClass,
    validate,
    classController.createClass
);

/**
 * @swagger
 * /classes/search:
 *   get:
 *     summary: Search classes
 *     description: Search classes by code, name or level.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         example: SHS
 *     responses:
 *       200:
 *         description: Classes retrieved successfully.
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
    classValidator.searchClass,
    validate,
    classController.searchClasses
);

/**
 * @swagger
 * /classes/archived:
 *   get:
 *     summary: Retrieve archived classes
 *     description: Returns all archived classes.
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived classes retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classController.getArchivedClasses
);

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Retrieve class by ID
 *     description: Returns a class using its ID.
 *     tags: [Classes]
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
 *         description: Class retrieved successfully.
 *       404:
 *         description: Class not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classValidator.validateClassId,
    validate,
    classController.getClassById
);

/**
 * @swagger
 * /classes/{id}:
 *   put:
 *     summary: Update class
 *     description: Updates an existing class.
 *     tags: [Classes]
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
 *                 example: SHS1A
 *               name:
 *                 type: string
 *                 example: SHS 1 Science A
 *               level:
 *                 type: string
 *                 example: Senior High
 *               capacity:
 *                 type: integer
 *                 example: 55
 *               description:
 *                 type: string
 *                 example: Updated description.
 *     responses:
 *       200:
 *         description: Class updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classValidator.updateClass,
    validate,
    classController.updateClass
);

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: Archive class
 *     description: Soft deletes a class.
 *     tags: [Classes]
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
 *         description: Class archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classValidator.validateClassId,
    validate,
    classController.deleteClass
);

/**
 * @swagger
 * /classes/{id}/restore:
 *   patch:
 *     summary: Restore archived class
 *     description: Restores an archived class.
 *     tags: [Classes]
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
 *         description: Class restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classValidator.validateClassId,
    validate,
    classController.restoreClass
);

module.exports = router;