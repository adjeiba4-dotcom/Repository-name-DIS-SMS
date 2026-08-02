// routes/examination.routes.js

const express = require("express");
const router = express.Router();

const examinationController = require("../controllers/examination.controller");

const examinationValidator = require("../validators/examination.validator");

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
 *   name: Examinations
 *   description: Examination Management APIs
 */

/**
 * @swagger
 * /examinations:
 *   get:
 *     summary: Retrieve all examinations
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Examinations retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    examinationController.getExaminations
);

/**
 * @swagger
 * /examinations/search:
 *   get:
 *     summary: Search examinations
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search by examination, subject, teacher, academic year or term
 *     responses:
 *       200:
 *         description: Examination search completed successfully.
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    examinationValidator.searchExaminations,
    validate,
    examinationController.searchExaminations
);

/**
 * @swagger
 * /examinations/{id}:
 *   get:
 *     summary: Retrieve examination by ID
 *     tags: [Examinations]
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
 *         description: Examination retrieved successfully.
 *       404:
 *         description: Examination not found.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    examinationValidator.validateExaminationId,
    validate,
    examinationController.getExaminationById
);

/**
 * @swagger
 * /examinations:
 *   post:
 *     summary: Create examination
 *     tags: [Examinations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Examination created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    examinationValidator.createExamination,
    validate,
    examinationController.createExamination
);

/**
 * @swagger
 * /examinations/{id}:
 *   put:
 *     summary: Update examination
 *     tags: [Examinations]
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
 *         description: Examination updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    examinationValidator.validateExaminationId,
    examinationValidator.updateExamination,
    validate,
    examinationController.updateExamination
);

/**
 * @swagger
 * /examinations/{id}:
 *   delete:
 *     summary: Delete examination
 *     tags: [Examinations]
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
 *         description: Examination deleted successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    examinationValidator.validateExaminationId,
    validate,
    examinationController.deleteExamination
);

module.exports = router;