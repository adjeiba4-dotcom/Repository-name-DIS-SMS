const express = require("express");

const {
    getResults,
    getResultById,
    createResult,
    updateResult,
    deleteResult,
} = require("../controllers/result.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createResultValidator,
    updateResultValidator,
} = require("../validators/result.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Results
 *     description: Student examination results management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Result:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         studentId:
 *           type: integer
 *           example: 15
 *         examinationId:
 *           type: integer
 *           example: 3
 *         subjectId:
 *           type: integer
 *           example: 5
 *         marksObtained:
 *           type: number
 *           format: float
 *           example: 82.5
 *         totalMarks:
 *           type: number
 *           format: float
 *           example: 100
 *         grade:
 *           type: string
 *           example: A
 *         remarks:
 *           type: string
 *           example: Excellent Performance
 *
 *     CreateResultRequest:
 *       type: object
 *       required:
 *         - studentId
 *         - examinationId
 *         - subjectId
 *         - marksObtained
 *         - totalMarks
 *       properties:
 *         studentId:
 *           type: integer
 *           example: 15
 *         examinationId:
 *           type: integer
 *           example: 3
 *         subjectId:
 *           type: integer
 *           example: 5
 *         marksObtained:
 *           type: number
 *           format: float
 *           example: 82.5
 *         totalMarks:
 *           type: number
 *           format: float
 *           example: 100
 *         remarks:
 *           type: string
 *           example: Excellent Performance
 *
 *     UpdateResultRequest:
 *       type: object
 *       properties:
 *         marksObtained:
 *           type: number
 *           format: float
 *         totalMarks:
 *           type: number
 *           format: float
 *         grade:
 *           type: string
 *         remarks:
 *           type: string
 */

/**
 * @swagger
 * /results:
 *   get:
 *     summary: Retrieve all examination results
 *     description: Returns all student examination results.
 *     tags:
 *       - Results
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Results retrieved successfully.
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
    getResults
);

/**
 * @swagger
 * /results/{id}:
 *   get:
 *     summary: Retrieve a result by ID
 *     tags:
 *       - Results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Result retrieved successfully.
 *       404:
 *         description: Result not found.
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
    getResultById
);

/**
 * @swagger
 * /results:
 *   post:
 *     summary: Create examination result
 *     description: Records a student's examination result.
 *     tags:
 *       - Results
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResultRequest'
 *     responses:
 *       201:
 *         description: Result created successfully.
 *       400:
 *         description: Validation error.
 */
router.post(
    "/",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.TEACHER
    ),
    createResultValidator,
    validate,
    createResult
);

/**
 * @swagger
 * /results/{id}:
 *   put:
 *     summary: Update examination result
 *     tags:
 *       - Results
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
 *             $ref: '#/components/schemas/UpdateResultRequest'
 *     responses:
 *       200:
 *         description: Result updated successfully.
 *       404:
 *         description: Result not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.TEACHER
    ),
    updateResultValidator,
    validate,
    updateResult
);

/**
 * @swagger
 * /results/{id}:
 *   delete:
 *     summary: Delete an examination result
 *     description: Permanently removes an examination result.
 *     tags:
 *       - Results
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
 *         description: Result deleted successfully.
 *       404:
 *         description: Result not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteResult
);

module.exports = router;