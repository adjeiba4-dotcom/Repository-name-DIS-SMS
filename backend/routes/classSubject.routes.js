// routes/classSubject.routes.js

const express = require("express");
const router = express.Router();

const classSubjectController = require("../controllers/classSubject.controller");
const classSubjectValidator = require("../validators/classSubject.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Class Subjects
 *   description: Class Subject Allocation Management APIs
 */

/**
 * @swagger
 * /class-subjects:
 *   get:
 *     summary: Retrieve class subject allocations (paginated + search + filters)
 *     tags: [Class Subjects]
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
 *         name: schoolClassId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: teacherSubjectId
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
 *         name: isCompulsory
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
 *         description: Class subject allocations retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classSubjectValidator.listClassSubjects,
    validate,
    classSubjectController.getClassSubjects
);

/**
 * @swagger
 * /class-subjects:
 *   post:
 *     summary: Create a class subject allocation
 *     tags: [Class Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schoolClassId
 *               - teacherSubjectId
 *               - weeklyPeriods
 *             properties:
 *               schoolClassId:
 *                 type: integer
 *               teacherSubjectId:
 *                 type: integer
 *               academicYearId:
 *                 type: integer
 *               termId:
 *                 type: integer
 *                 nullable: true
 *               weeklyPeriods:
 *                 type: integer
 *                 example: 4
 *               isCompulsory:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               remarks:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       201:
 *         description: Class subject allocation created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classSubjectValidator.createClassSubject,
    validate,
    classSubjectController.createClassSubject
);

/**
 * @swagger
 * /class-subjects/archived:
 *   get:
 *     summary: Retrieve archived class subject allocations
 *     tags: [Class Subjects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived class subject allocations retrieved successfully.
 */
router.get(
    "/archived",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classSubjectController.getArchivedClassSubjects
);

/**
 * @swagger
 * /class-subjects/{id}:
 *   get:
 *     summary: Retrieve class subject allocation by ID
 *     tags: [Class Subjects]
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
 *         description: Class subject allocation retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classSubjectValidator.validateClassSubjectId,
    validate,
    classSubjectController.getClassSubjectById
);

/**
 * @swagger
 * /class-subjects/{id}:
 *   put:
 *     summary: Update class subject allocation
 *     tags: [Class Subjects]
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
 *         description: Class subject allocation updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classSubjectValidator.updateClassSubject,
    validate,
    classSubjectController.updateClassSubject
);

/**
 * @swagger
 * /class-subjects/{id}:
 *   delete:
 *     summary: Archive class subject allocation
 *     tags: [Class Subjects]
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
 *         description: Class subject allocation archived successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classSubjectValidator.validateClassSubjectId,
    validate,
    classSubjectController.deleteClassSubject
);

/**
 * @swagger
 * /class-subjects/{id}/restore:
 *   patch:
 *     summary: Restore archived class subject allocation
 *     tags: [Class Subjects]
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
 *         description: Class subject allocation restored successfully.
 */
router.patch(
    "/:id/restore",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    classSubjectValidator.restoreClassSubject,
    validate,
    classSubjectController.restoreClassSubject
);

module.exports = router;
