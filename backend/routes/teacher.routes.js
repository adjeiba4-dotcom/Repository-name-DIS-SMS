// routes/teacher.routes.js

const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacher.controller");

const {
    createTeacher,
    updateTeacher,
    validateTeacherId,
    searchTeacher,
} = require("../validators/teacher.validator");

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
 *   name: Teachers
 *   description: Teacher Management APIs
 */

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Retrieve all teachers
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teachers retrieved successfully
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    teacherController.getTeachers
);

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    createTeacher,
    validate,
    teacherController.createTeacher
);

/**
 * @swagger
 * /teachers/search:
 *   get:
 *     summary: Search teachers
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    searchTeacher,
    validate,
    teacherController.searchTeachers
);

/**
 * @swagger
 * /teachers/archived:
 *   get:
 *     summary: Retrieve archived teachers
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    teacherController.getArchivedTeachers
);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Retrieve teacher by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateTeacherId,
    validate,
    teacherController.getTeacherById
);

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    updateTeacher,
    validate,
    teacherController.updateTeacher
);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Archive teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateTeacherId,
    validate,
    teacherController.deleteTeacher
);

/**
 * @swagger
 * /teachers/{id}/restore:
 *   patch:
 *     summary: Restore archived teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    validateTeacherId,
    validate,
    teacherController.restoreTeacher
);

module.exports = router;