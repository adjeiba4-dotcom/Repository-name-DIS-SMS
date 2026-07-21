const express = require("express");

const {
    getTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
} = require("../controllers/teacher.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createTeacherValidator,
    updateTeacherValidator,
} = require("../validators/teacher.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Teachers
 *     description: Teacher management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         employeeNumber:
 *           type: string
 *           example: TCH2026001
 *         firstName:
 *           type: string
 *           example: Akosua
 *         lastName:
 *           type: string
 *           example: Owusu
 *         gender:
 *           type: string
 *           example: Female
 *         email:
 *           type: string
 *           format: email
 *           example: akosua.owusu@dissms.edu.gh
 *         phone:
 *           type: string
 *           example: +233241234567
 *         department:
 *           type: string
 *           example: Mathematics
 *         status:
 *           type: string
 *           example: Active
 *
 *     CreateTeacherRequest:
 *       type: object
 *       required:
 *         - employeeNumber
 *         - firstName
 *         - lastName
 *       properties:
 *         employeeNumber:
 *           type: string
 *           example: TCH2026001
 *         firstName:
 *           type: string
 *           example: Akosua
 *         lastName:
 *           type: string
 *           example: Owusu
 *         gender:
 *           type: string
 *           example: Female
 *         email:
 *           type: string
 *           format: email
 *           example: akosua.owusu@dissms.edu.gh
 *         phone:
 *           type: string
 *           example: +233241234567
 *         department:
 *           type: string
 *           example: Mathematics
 *
 *     UpdateTeacherRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         gender:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         department:
 *           type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Retrieve all teachers
 *     description: Returns a list of all teachers.
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teachers retrieved successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
router.get(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR
    ),
    getTeachers
);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Retrieve a teacher by ID
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher retrieved successfully.
 *       404:
 *         description: Teacher not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR
    ),
    getTeacherById
);

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Register a new teacher
 *     description: Creates a new teacher record.
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeacherRequest'
 *     responses:
 *       201:
 *         description: Teacher created successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    createTeacherValidator,
    validate,
    createTeacher
);

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update teacher information
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTeacherRequest'
 *     responses:
 *       200:
 *         description: Teacher updated successfully.
 *       404:
 *         description: Teacher not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER
    ),
    updateTeacherValidator,
    validate,
    updateTeacher
);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete a teacher
 *     description: Permanently removes a teacher record.
 *     tags:
 *       - Teachers
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
 *         description: Teacher deleted successfully.
 *       404:
 *         description: Teacher not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteTeacher
);

module.exports = router;