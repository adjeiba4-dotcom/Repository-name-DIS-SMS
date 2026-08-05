// routes/subject.routes.js

const express = require("express");
const router = express.Router();

const subjectController = require("../controllers/subject.controller");
const subjectValidator = require("../validators/subject.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject Management APIs
 */

/**
 * @swagger
 * /subjects:
 *   get:
 *     summary: Retrieve subjects (paginated + search + filters)
 *     tags: [Subjects]
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
 *         name: departmentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: schoolClassId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [CORE, ELECTIVE]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    subjectValidator.listSubjects,
    validate,
    subjectController.getSubjects
);

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectCode
 *               - subjectName
 *               - shortName
 *               - creditHours
 *             properties:
 *               subjectCode:
 *                 type: string
 *                 example: MATH101
 *               subjectName:
 *                 type: string
 *                 example: Core Mathematics
 *               shortName:
 *                 type: string
 *                 example: Math
 *               departmentId:
 *                 type: integer
 *                 nullable: true
 *               schoolClassId:
 *                 type: integer
 *                 nullable: true
 *               category:
 *                 type: string
 *                 enum: [CORE, ELECTIVE]
 *               creditHours:
 *                 type: integer
 *                 example: 3
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       201:
 *         description: Subject created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    subjectValidator.createSubject,
    validate,
    subjectController.createSubject
);

/**
 * @swagger
 * /subjects/archived:
 *   get:
 *     summary: Retrieve archived subjects
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived subjects retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    subjectController.getArchivedSubjects
);

/**
 * @swagger
 * /subjects/{id}:
 *   get:
 *     summary: Retrieve subject by ID
 *     tags: [Subjects]
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
 *         description: Subject retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    subjectValidator.validateSubjectId,
    validate,
    subjectController.getSubjectById
);

/**
 * @swagger
 * /subjects/{id}:
 *   put:
 *     summary: Update subject
 *     tags: [Subjects]
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
 *         description: Subject updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    subjectValidator.updateSubject,
    validate,
    subjectController.updateSubject
);

/**
 * @swagger
 * /subjects/{id}:
 *   delete:
 *     summary: Archive subject
 *     tags: [Subjects]
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
 *         description: Subject archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    subjectValidator.validateSubjectId,
    validate,
    subjectController.deleteSubject
);

/**
 * @swagger
 * /subjects/{id}/restore:
 *   patch:
 *     summary: Restore archived subject
 *     tags: [Subjects]
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
 *         description: Subject restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    subjectValidator.restoreSubject,
    validate,
    subjectController.restoreSubject
);

module.exports = router;
