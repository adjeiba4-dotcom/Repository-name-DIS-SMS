// routes/teacherSubject.routes.js

const express = require("express");
const router = express.Router();

const teacherSubjectController = require("../controllers/teacherSubject.controller");

const {
    createTeacherSubject,
    updateTeacherSubject,
    validateTeacherSubjectId,
    searchTeacherSubject,
} = require("../validators/teacherSubject.validator");

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
 *   name: Teacher Subjects
 *   description: Teacher Subject Assignment APIs
 */

/**
 * @swagger
 * /teacher-subjects:
 *   get:
 *     summary: Retrieve all teacher subject assignments
 *     tags: [Teacher Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher subject assignments retrieved successfully
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    teacherSubjectController.getTeacherSubjects
);

/**
 * @swagger
 * /teacher-subjects:
 *   post:
 *     summary: Assign subject to teacher
 *     tags: [Teacher Subjects]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    createTeacherSubject,
    validate,
    teacherSubjectController.createTeacherSubject
);

/**
 * @swagger
 * /teacher-subjects/search:
 *   get:
 *     summary: Search teacher subject assignments
 *     tags: [Teacher Subjects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    searchTeacherSubject,
    validate,
    teacherSubjectController.searchTeacherSubjects
);

/**
 * @swagger
 * /teacher-subjects/{id}:
 *   get:
 *     summary: Retrieve teacher subject assignment by ID
 *     tags: [Teacher Subjects]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateTeacherSubjectId,
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
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    updateTeacherSubject,
    validate,
    teacherSubjectController.updateTeacherSubject
);

/**
 * @swagger
 * /teacher-subjects/{id}:
 *   delete:
 *     summary: Delete teacher subject assignment
 *     tags: [Teacher Subjects]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    validateTeacherSubjectId,
    validate,
    teacherSubjectController.deleteTeacherSubject
);

module.exports = router;