// routes/timetable.routes.js

const express = require("express");
const router = express.Router();

const timetableController = require("../controllers/timetable.controller");
const timetableValidator = require("../validators/timetable.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Timetable
 *   description: Timetable Management APIs
 */

/**
 * @swagger
 * /timetables:
 *   get:
 *     summary: Retrieve timetable entries (paginated + search + filters)
 *     tags: [Timetable]
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
 *         name: academicYearId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: termId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: dayOfWeek
 *         schema:
 *           type: string
 *           enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Timetable entries retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    timetableValidator.listTimetables,
    validate,
    timetableController.getTimetables
);

/**
 * @swagger
 * /timetables/view:
 *   get:
 *     summary: Retrieve scoped timetable view (grid, class, teacher, subject)
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: view
 *         schema:
 *           type: string
 *           enum: [grid, class, teacher, subject]
 *       - in: query
 *         name: academicYearId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: termId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Timetable view retrieved successfully.
 */
router.get(
    "/view",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    timetableValidator.viewTimetables,
    validate,
    timetableController.getTimetableView
);

/**
 * @swagger
 * /timetables:
 *   post:
 *     summary: Create a timetable entry
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - academicYearId
 *               - termId
 *               - classId
 *               - subjectId
 *               - teacherId
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *             properties:
 *               academicYearId:
 *                 type: integer
 *               termId:
 *                 type: integer
 *               classId:
 *                 type: integer
 *               subjectId:
 *                 type: integer
 *               teacherId:
 *                 type: integer
 *               dayOfWeek:
 *                 type: string
 *                 enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 example: "08:40"
 *               room:
 *                 type: string
 *               remarks:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       201:
 *         description: Timetable entry created successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    timetableValidator.createTimetable,
    validate,
    timetableController.createTimetable
);

/**
 * @swagger
 * /timetables/{id}:
 *   get:
 *     summary: Retrieve timetable entry by ID
 *     tags: [Timetable]
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
 *         description: Timetable entry retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    timetableValidator.validateTimetableId,
    validate,
    timetableController.getTimetableById
);

/**
 * @swagger
 * /timetables/{id}:
 *   put:
 *     summary: Update timetable entry
 *     tags: [Timetable]
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
 *         description: Timetable entry updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    timetableValidator.updateTimetable,
    validate,
    timetableController.updateTimetable
);

/**
 * @swagger
 * /timetables/{id}:
 *   delete:
 *     summary: Delete timetable entry
 *     tags: [Timetable]
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
 *         description: Timetable entry deleted successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    timetableValidator.validateTimetableId,
    validate,
    timetableController.deleteTimetable
);

module.exports = router;
