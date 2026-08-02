// routes/attendance.routes.js

const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");

const attendanceValidator = require("../validators/attendance.validator");

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
 *   name: Attendance
 *   description: Student Attendance Management APIs
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Retrieve all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 */
router.get(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    attendanceController.getAttendance
);

/**
 * @swagger
 * /attendance/search:
 *   get:
 *     summary: Search attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance search completed successfully
 */
router.get(
    "/search",
    authenticate,
    authorize(ROLES.ADMIN),
    attendanceValidator.searchAttendance,
    validate,
    attendanceController.searchAttendance
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
 *         description: Attendance record retrieved successfully
 */
router.get(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    attendanceValidator.validateAttendanceId,
    validate,
    attendanceController.getAttendanceById
);

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Record student attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Attendance recorded successfully
 */
router.post(
    "/",
    authenticate,
    authorize(ROLES.ADMIN),
    attendanceValidator.createAttendance,
    validate,
    attendanceController.createAttendance
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
 *         description: Attendance updated successfully
 */
router.put(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    attendanceValidator.validateAttendanceId,
    attendanceValidator.updateAttendance,
    validate,
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
 *         description: Attendance deleted successfully
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMIN),
    attendanceValidator.validateAttendanceId,
    validate,
    attendanceController.deleteAttendance
);

module.exports = router;