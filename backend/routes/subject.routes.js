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
 *     summary: Retrieve all subjects
 *     description: Returns a list of all active subjects.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully.
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
    subjectController.getSubjects
);

/**
 * @swagger
 * /subjects:
 *   post:
 *     summary: Create a new subject
 *     description: Creates a new academic subject.
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
 *               - code
 *               - name
 *               - departmentId
 *             properties:
 *               code:
 *                 type: string
 *                 example: MATH101
 *               name:
 *                 type: string
 *                 example: Mathematics
 *               departmentId:
 *                 type: integer
 *                 example: 1
 *               schoolClassId:
 *                 type: integer
 *                 example: 2
 *               creditHours:
 *                 type: integer
 *                 example: 3
 *               description:
 *                 type: string
 *                 example: Core Mathematics subject
 *     responses:
 *       201:
 *         description: Subject created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       409:
 *         description: Subject code already exists.
 *       500:
 *         description: Internal server error.
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
 * /subjects/search:
 *   get:
 *     summary: Search subjects
 *     description: Search subjects by code or name.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         example: Mathematics
 *         description: Subject name or code
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully.
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
    subjectValidator.searchSubject,
    validate,
    subjectController.searchSubjects
);

/**
 * @swagger
 * /subjects/archived:
 *   get:
 *     summary: Retrieve archived subjects
 *     description: Returns all archived (soft deleted) subjects.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived subjects retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
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
 *     summary: Retrieve a subject by ID
 *     description: Returns a single subject using its ID.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject retrieved successfully.
 *       400:
 *         description: Invalid subject ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Internal server error.
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
 *     summary: Update a subject
 *     description: Update an existing subject by ID.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: MATH101
 *               name:
 *                 type: string
 *                 example: Mathematics
 *               departmentId:
 *                 type: integer
 *                 example: 1
 *               schoolClassId:
 *                 type: integer
 *                 example: 2
 *               creditHours:
 *                 type: integer
 *                 example: 3
 *               description:
 *                 type: string
 *                 example: Updated Mathematics subject
 *     responses:
 *       200:
 *         description: Subject updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Internal server error.
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
 *     summary: Archive a subject
 *     description: Soft delete (archive) a subject by ID.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject archived successfully.
 *       400:
 *         description: Invalid subject ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Internal server error.
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
 *     summary: Restore an archived subject
 *     description: Restore a previously archived subject.
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject restored successfully.
 *       400:
 *         description: Invalid subject ID.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Internal server error.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    subjectValidator.validateSubjectId,
    validate,
    subjectController.restoreSubject
);

module.exports = router;