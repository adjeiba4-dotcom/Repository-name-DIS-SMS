// routes/teacherSubject.routes.js

const express = require("express");
const router = express.Router();

const teacherSubjectController = require("../controllers/teacherSubject.controller");
const teacherSubjectValidator = require("../validators/teacherSubject.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Teacher Subjects
 *   description: Teacher Subject Assignment Management APIs
 */

/**
 * @swagger
 * /teacher-subjects:
 *   get:
 *     summary: Retrieve teacher subject assignments (paginated + search + filters)
 *     tags: [Teacher Subjects]
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
 *         name: teacherId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: academicYearId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: termId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isPrimary
 *         schema:
 *           type: string
 *           enum: [true, false]
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
 *         description: Teacher subject assignments retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    teacherSubjectValidator.listTeacherSubjects,
    validate,
    teacherSubjectController.getTeacherSubjects
);

/**
 * @swagger
 * /teacher-subjects:
 *   post:
 *     summary: Create a teacher subject assignment
 *     tags: [Teacher Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teacherId
 *               - subjectId
 *               - academicYearId
 *               - weeklyPeriods
 *             properties:
 *               teacherId:
 *                 type: integer
 *               subjectId:
 *                 type: integer
 *               academicYearId:
 *                 type: integer
 *               termId:
 *                 type: integer
 *                 nullable: true
 *               isPrimary:
 *                 type: boolean
 *               weeklyPeriods:
 *                 type: integer
 *                 example: 4
 *               remarks:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       201:
 *         description: Teacher subject assignment created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    teacherSubjectValidator.createTeacherSubject,
    validate,
    teacherSubjectController.createTeacherSubject
);

/**
 * @swagger
 * /teacher-subjects/archived:
 *   get:
 *     summary: Retrieve archived teacher subject assignments
 *     tags: [Teacher Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived teacher subject assignments retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    teacherSubjectController.getArchivedTeacherSubjects
);

/**
 * @swagger
 * /teacher-subjects/{id}:
 *   get:
 *     summary: Retrieve teacher subject assignment by ID
 *     tags: [Teacher Subjects]
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
 *         description: Teacher subject assignment retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    teacherSubjectValidator.validateTeacherSubjectId,
    validate,
    teacherSubjectController.getTeacherSubjectById
);

/**
 * @swagger
 * /teacher-subjects/{id}:
 *   put:
 *     summary: Update teacher subject assignment
 *     tags: [Teacher Subjects]
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
 *         description: Teacher subject assignment updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    teacherSubjectValidator.updateTeacherSubject,
    validate,
    teacherSubjectController.updateTeacherSubject
);

/**
 * @swagger
 * /teacher-subjects/{id}:
 *   delete:
 *     summary: Archive teacher subject assignment
 *     tags: [Teacher Subjects]
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
 *         description: Teacher subject assignment archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    teacherSubjectValidator.validateTeacherSubjectId,
    validate,
    teacherSubjectController.deleteTeacherSubject
);

/**
 * @swagger
 * /teacher-subjects/{id}/restore:
 *   patch:
 *     summary: Restore archived teacher subject assignment
 *     tags: [Teacher Subjects]
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
 *         description: Teacher subject assignment restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    teacherSubjectValidator.restoreTeacherSubject,
    validate,
    teacherSubjectController.restoreTeacherSubject
);

module.exports = router;
