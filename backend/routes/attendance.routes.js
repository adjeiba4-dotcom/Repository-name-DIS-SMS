const express = require("express");

const {
    getAttendance,
    getAttendanceById,
    createAttendance,
    updateAttendance,
    deleteAttendance,
} = require("../controllers/attendance.controller");

const {
    authenticate,
    authorize,
} = require("../middleware/auth.middleware");

const { validate } = require("../middleware/validation.middleware");

const ROLES = require("../constants/roles");

const {
    createAttendanceValidator,
    updateAttendanceValidator,
} = require("../validators/attendance.validator");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Attendance
 *     description: Student attendance management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         studentId:
 *           type: integer
 *           example: 15
 *         classId:
 *           type: integer
 *           example: 3
 *         attendanceDate:
 *           type: string
 *           format: date
 *           example: 2026-09-15
 *         status:
 *           type: string
 *           example: Present
 *         remarks:
 *           type: string
 *           example: Arrived on time
 *
 *     CreateAttendanceRequest:
 *       type: object
 *       required:
 *         - studentId
 *         - classId
 *         - attendanceDate
 *         - status
 *       properties:
 *         studentId:
 *           type: integer
 *           example: 15
 *         classId:
 *           type: integer
 *           example: 3
 *         attendanceDate:
 *           type: string
 *           format: date
 *           example: 2026-09-15
 *         status:
 *           type: string
 *           enum:
 *             - Present
 *             - Absent
 *             - Late
 *             - Excused
 *           example: Present
 *         remarks:
 *           type: string
 *           example: Arrived on time
 *
 *     UpdateAttendanceRequest:
 *       type: object
 *       properties:
 *         attendanceDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum:
 *             - Present
 *             - Absent
 *             - Late
 *             - Excused
 *         remarks:
 *           type: string
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: Retrieve all attendance records
 *     description: Returns all student attendance records.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully.
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
    getAttendance
);

/**
 * @swagger
 * /attendance/{id}:
 *   get:
 *     summary: Retrieve an attendance record by ID
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record retrieved successfully.
 *       404:
 *         description: Attendance record not found.
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
    getAttendanceById
);

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Record student attendance
 *     description: Creates a new attendance record.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttendanceRequest'
 *     responses:
 *       201:
 *         description: Attendance recorded successfully.
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
    createAttendanceValidator,
    validate,
    createAttendance
);

/**
 * @swagger
 * /attendance/{id}:
 *   put:
 *     summary: Update an attendance record
 *     tags:
 *       - Attendance
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
 *             $ref: '#/components/schemas/UpdateAttendanceRequest'
 *     responses:
 *       200:
 *         description: Attendance updated successfully.
 *       404:
 *         description: Attendance record not found.
 */
router.put(
    "/:id",
    authenticate,
    authorize(
        ROLES.ADMINISTRATOR,
        ROLES.TEACHER
    ),
    updateAttendanceValidator,
    validate,
    updateAttendance
);

/**
 * @swagger
 * /attendance/{id}:
 *   delete:
 *     summary: Delete an attendance record
 *     description: Permanently removes an attendance record.
 *     tags:
 *       - Attendance
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
 *       404:
 *         description: Attendance record not found.
 */
router.delete(
    "/:id",
    authenticate,
    authorize(ROLES.ADMINISTRATOR),
    deleteAttendance
);

module.exports = router;