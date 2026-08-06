// routes/attendance.routes.js

const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");
const attendanceValidator = require("../validators/attendance.validator");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");
const { audit } = require("../middleware/audit.middleware");

const ROLES = require("../constants/roles");

const writeRoles = [
    ROLES.ADMINISTRATOR,
    ROLES.HEADMASTER,
    ROLES.REGISTRAR,
    ROLES.TEACHER,
];

const readRoles = [
    ROLES.ADMINISTRATOR,
    ROLES.HEADMASTER,
    ROLES.REGISTRAR,
    ROLES.TEACHER,
];

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Student Attendance Management APIs
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Retrieve attendance records (paginated + search + filters)
 *     tags: [Attendance]
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
 *         name: studentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *       - in: query
 *         name: attendanceDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully.
 */
router.get(
    "/",
    authenticate,
    authorize(...readRoles),
    attendanceValidator.listAttendance,
    validate,
    attendanceController.getAttendance
);

/**
 * @swagger
 * /attendance/roster:
 *   get:
 *     summary: Retrieve class attendance roster for a date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: attendanceDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance roster retrieved successfully.
 */
router.get(
    "/roster",
    authenticate,
    authorize(...readRoles),
    attendanceValidator.rosterAttendance,
    validate,
    attendanceController.getRoster
);

/**
 * @swagger
 * /attendance/stats:
 *   get:
 *     summary: Retrieve attendance statistics and summaries
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, class, teacher, student]
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
 *         name: studentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: attendanceDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved successfully.
 */
router.get(
    "/stats",
    authenticate,
    authorize(...readRoles),
    attendanceValidator.statsAttendance,
    validate,
    attendanceController.getStats
);

/**
 * @swagger
 * /attendance/bulk:
 *   post:
 *     summary: Bulk mark, upsert, or clear class attendance
 *     tags: [Attendance]
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
 *               - attendanceDate
 *             properties:
 *               academicYearId:
 *                 type: integer
 *               termId:
 *                 type: integer
 *               classId:
 *                 type: integer
 *               attendanceDate:
 *                 type: string
 *                 format: date
 *               action:
 *                 type: string
 *                 enum: [MARK_PRESENT, MARK_ABSENT, CLEAR, UPSERT]
 *               entries:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *                     remarks:
 *                       type: string
 *     responses:
 *       200:
 *         description: Bulk attendance processed successfully.
 */
router.post(
    "/bulk",
    authenticate,
    authorize(...writeRoles),
    attendanceValidator.bulkAttendance,
    validate,
    audit("BULK_UPDATE", "Attendance", {
        entityType: "Attendance",
        includeBody: true,
    }),
    attendanceController.bulkAttendance
);

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Record student attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - academicYearId
 *               - termId
 *               - attendanceDate
 *               - status
 *             properties:
 *               studentId:
 *                 type: integer
 *               academicYearId:
 *                 type: integer
 *               termId:
 *                 type: integer
 *               classId:
 *                 type: integer
 *               attendanceDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LATE, EXCUSED]
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance recorded successfully.
 */
router.post(
    "/",
    authenticate,
    authorize(...writeRoles),
    attendanceValidator.createAttendance,
    validate,
    audit("CREATE", "Attendance", {
        entityType: "Attendance",
        includeBody: true,
    }),
    attendanceController.createAttendance
);

/**
 * @swagger
 * /attendance/{id}:
 *   get:
 *     summary: Retrieve attendance record by ID
 *     tags: [Attendance]
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
 *         description: Attendance record retrieved successfully.
 */
router.get(
    "/:id",
    authenticate,
    authorize(...readRoles),
    attendanceValidator.validateAttendanceId,
    validate,
    attendanceController.getAttendanceById
);

/**
 * @swagger
 * /attendance/{id}:
 *   put:
 *     summary: Update attendance record
 *     tags: [Attendance]
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
 *         description: Attendance updated successfully.
 */
router.put(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    attendanceValidator.updateAttendance,
    validate,
    audit("UPDATE", "Attendance", {
        entityType: "Attendance",
        includeBody: true,
    }),
    attendanceController.updateAttendance
);

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     tags: [Attendance]
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
 *         description: Attendance deleted successfully.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(...writeRoles),
    attendanceValidator.validateAttendanceId,
    validate,
    audit("DELETE", "Attendance", {
        entityType: "Attendance",
        recordIdResolver: (req) => Number(req.params.id),
    }),
    attendanceController.deleteAttendance
);

module.exports = router;
