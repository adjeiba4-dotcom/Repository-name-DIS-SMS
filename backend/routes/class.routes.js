// routes/class.routes.js

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
 *     summary: Retrieve classes (paginated + search + filters)
 *     tags: [Classes]
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
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Classes retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classValidator.listClasses,
    validate,
    classController.getClasses
);

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new school class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Class created successfully.
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
 * /classes/archived:
 *   get:
 *     summary: Retrieve archived classes
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
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Class retrieved successfully.
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
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
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
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
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
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Class restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classValidator.restoreClass,
    validate,
    classController.restoreClass
);

module.exports = router;
