// routes/grade.routes.js

const express = require("express");
const router = express.Router();

const gradeController = require("../controllers/grade.controller");
const gradeValidator = require("../validators/grade.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");
const { audit } = require("../middleware/audit.middleware");

const ROLES = require("../constants/roles");

const adminRoles = [ROLES.ADMINISTRATOR];
const readRoles = [
    ROLES.ADMINISTRATOR,
    ROLES.HEADMASTER,
    ROLES.REGISTRAR,
    ROLES.TEACHER,
];

/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Configurable grade scales and score bands for the Results Engine
 */

/**
 * @swagger
 * /grades/scales:
 *   get:
 *     summary: List grade scales (with bands)
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grade scales retrieved successfully.
 */
router.get(
    "/scales",
    authenticate,
    authorize(...readRoles),
    gradeValidator.listScales,
    validate,
    gradeController.listScales
);

/**
 * @swagger
 * /grades/scales:
 *   post:
 *     summary: Create a grade scale
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Grade scale created successfully.
 */
router.post(
    "/scales",
    authenticate,
    authorize(...adminRoles),
    gradeValidator.createScale,
    validate,
    audit("GRADE_SCALE_CREATE", "GradeScale"),
    gradeController.createScale
);

/**
 * @swagger
 * /grades/scales/{id}:
 *   get:
 *     summary: Get a grade scale by id
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grade scale retrieved successfully.
 */
router.get(
    "/scales/:id",
    authenticate,
    authorize(...readRoles),
    gradeValidator.validateScaleId,
    validate,
    gradeController.getScaleById
);

/**
 * @swagger
 * /grades/scales/{id}:
 *   put:
 *     summary: Update a grade scale
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grade scale updated successfully.
 */
router.put(
    "/scales/:id",
    authenticate,
    authorize(...adminRoles),
    gradeValidator.validateScaleId,
    gradeValidator.updateScale,
    validate,
    audit("GRADE_SCALE_UPDATE", "GradeScale"),
    gradeController.updateScale
);

/**
 * @swagger
 * /grades/scales/{id}/default:
 *   patch:
 *     summary: Set the default grade scale used by Results generation
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default grade scale updated successfully.
 */
router.patch(
    "/scales/:id/default",
    authenticate,
    authorize(...adminRoles),
    gradeValidator.validateScaleId,
    validate,
    audit("GRADE_SCALE_SET_DEFAULT", "GradeScale"),
    gradeController.setDefaultScale
);

/**
 * @swagger
 * /grades:
 *   get:
 *     summary: List grade bands
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grade bands retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(...readRoles),
    gradeValidator.listGrades,
    validate,
    gradeController.listGrades
);

/**
 * @swagger
 * /grades:
 *   post:
 *     summary: Create a grade band
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Grade band created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(...adminRoles),
    gradeValidator.createGrade,
    validate,
    audit("GRADE_CREATE", "Grade"),
    gradeController.createGrade
);

/**
 * @swagger
 * /grades/{id}:
 *   get:
 *     summary: Get a grade band by id
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grade band retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(...readRoles),
    gradeValidator.validateGradeId,
    validate,
    gradeController.getGradeById
);

/**
 * @swagger
 * /grades/{id}:
 *   put:
 *     summary: Update a grade band
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grade band updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(...adminRoles),
    gradeValidator.validateGradeId,
    gradeValidator.updateGrade,
    validate,
    audit("GRADE_UPDATE", "Grade"),
    gradeController.updateGrade
);

/**
 * @swagger
 * /grades/{id}:
 *   delete:
 *     summary: Deactivate a grade band
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grade band deactivated successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(...adminRoles),
    gradeValidator.validateGradeId,
    validate,
    audit("GRADE_DEACTIVATE", "Grade"),
    gradeController.deactivateGrade
);

module.exports = router;
