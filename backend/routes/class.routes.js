const express = require("express");

const {
    getClasses,
    getClassById,
    createClass,
    updateClass,
    deleteClass,
} = require("../controllers/class.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createClassValidator,
    updateClassValidator,
} = require("../validators/class.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Classes
 *     description: Class management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         className:
 *           type: string
 *           example: Form 1A
 *         classCode:
 *           type: string
 *           example: F1A
 *         department:
 *           type: string
 *           example: Science
 *         classTeacher:
 *           type: string
 *           example: Akosua Owusu
 *         capacity:
 *           type: integer
 *           example: 45
 *         status:
 *           type: string
 *           example: Active
 *
 *     CreateClassRequest:
 *       type: object
 *       required:
 *         - className
 *         - classCode
 *       properties:
 *         className:
 *           type: string
 *           example: Form 1A
 *         classCode:
 *           type: string
 *           example: F1A
 *         department:
 *           type: string
 *           example: Science
 *         classTeacher:
 *           type: string
 *           example: Akosua Owusu
 *         capacity:
 *           type: integer
 *           example: 45
 *
 *     UpdateClassRequest:
 *       type: object
 *       properties:
 *         className:
 *           type: string
 *         classCode:
 *           type: string
 *         department:
 *           type: string
 *         classTeacher:
 *           type: string
 *         capacity:
 *           type: integer
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Retrieve all classes
 *     description: Returns a list of all classes in the school.
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Classes retrieved successfully.
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
        ROLES.REGISTRAR,
        ROLES.TEACHER
    ),
    getClasses
);

/**
 * @swagger
 * /classes/{id}:
 *   get:
 *     summary: Retrieve a class by ID
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class retrieved successfully.
 *       404:
 *         description: Class not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR,
        ROLES.TEACHER
    ),
    getClassById
);

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new class
 *     description: Creates a new academic class.
 *     tags:
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClassRequest'
 *     responses:
 *       201:
 *         description: Class created successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR
    ),
    createClassValidator,
    validate,
    createClass
);

/**
 * @swagger
 * /classes/{id}:
 *   put:
 *     summary: Update class information
 *     tags:
 *       - Classes
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
 *             $ref: '#/components/schemas/UpdateClassRequest'
 *     responses:
 *       200:
 *         description: Class updated successfully.
 *       404:
 *         description: Class not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.HEADMASTER,
        ROLES.REGISTRAR
    ),
    updateClassValidator,
    validate,
    updateClass
);

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     description: Permanently removes a class.
 *     tags:
 *       - Classes
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
 *         description: Class deleted successfully.
 *       404:
 *         description: Class not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteClass
);

module.exports = router;