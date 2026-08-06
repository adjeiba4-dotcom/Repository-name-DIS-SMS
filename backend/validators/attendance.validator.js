// validators/attendance.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];
const BULK_ACTIONS = ["MARK_PRESENT", "MARK_ABSENT", "CLEAR", "UPSERT"];
const SUMMARY_SCOPES = [
    "daily",
    "weekly",
    "monthly",
    "class",
    "teacher",
    "student",
];

const optionalIntQuery = (field) =>
    query(field)
        .optional()
        .isInt({ min: 1 })
        .withMessage(`${field} must be a positive integer.`)
        .toInt();

const optionalDateQuery = (field) =>
    query(field)
        .optional()
        .isISO8601()
        .withMessage(`${field} must be a valid date.`);

exports.listAttendance = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer.")
        .toInt(),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100.")
        .toInt(),
    query("search").optional().trim().isLength({ max: 100 }),
    query("keyword").optional().trim().isLength({ max: 100 }),
    optionalIntQuery("academicYearId"),
    optionalIntQuery("termId"),
    optionalIntQuery("classId"),
    optionalIntQuery("studentId"),
    optionalIntQuery("teacherId"),
    query("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage(
            `Status must be one of: ${STATUS_VALUES.join(", ")}.`
        ),
    optionalDateQuery("attendanceDate"),
    optionalDateQuery("dateFrom"),
    optionalDateQuery("dateTo"),
    query("sortBy").optional().trim(),
    query("sortOrder")
        .optional()
        .trim()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc."),
];

exports.rosterAttendance = [
    query("academicYearId")
        .notEmpty()
        .withMessage("Academic year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic year must be a positive integer.")
        .toInt(),
    query("termId")
        .notEmpty()
        .withMessage("Term is required.")
        .isInt({ min: 1 })
        .withMessage("Term must be a positive integer.")
        .toInt(),
    query("classId")
        .notEmpty()
        .withMessage("Class is required.")
        .isInt({ min: 1 })
        .withMessage("Class must be a positive integer.")
        .toInt(),
    query("attendanceDate")
        .notEmpty()
        .withMessage("Attendance date is required.")
        .isISO8601()
        .withMessage("Attendance date must be a valid date."),
];

exports.statsAttendance = [
    query("scope")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toLowerCase())
        .isIn(SUMMARY_SCOPES)
        .withMessage(
            `Scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`
        ),
    optionalIntQuery("academicYearId"),
    optionalIntQuery("termId"),
    optionalIntQuery("classId"),
    optionalIntQuery("studentId"),
    optionalIntQuery("teacherId"),
    optionalDateQuery("attendanceDate"),
    optionalDateQuery("dateFrom"),
    optionalDateQuery("dateTo"),
];

exports.validateAttendanceId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Attendance ID must be a positive integer.")
        .toInt(),
];

exports.createAttendance = [
    body("studentId")
        .notEmpty()
        .withMessage("Student is required.")
        .isInt({ min: 1 })
        .withMessage("Student ID must be a positive integer.")
        .toInt(),

    body("academicYearId")
        .notEmpty()
        .withMessage("Academic year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic year must be a positive integer.")
        .toInt(),

    body("termId")
        .notEmpty()
        .withMessage("Term is required.")
        .isInt({ min: 1 })
        .withMessage("Term must be a positive integer.")
        .toInt(),

    body("classId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Class must be a positive integer.")
        .toInt(),

    body("attendanceDate")
        .notEmpty()
        .withMessage("Attendance date is required.")
        .isISO8601()
        .withMessage("Attendance date must be a valid date."),

    body("status")
        .notEmpty()
        .withMessage("Attendance status is required.")
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage(
            `Attendance status must be one of: ${STATUS_VALUES.join(", ")}.`
        ),

    body("remarks")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Remarks cannot exceed 500 characters."),
];

exports.updateAttendance = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Attendance ID must be a positive integer.")
        .toInt(),

    body("studentId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Student ID must be a positive integer.")
        .toInt(),

    body("academicYearId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Academic year must be a positive integer.")
        .toInt(),

    body("termId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Term must be a positive integer.")
        .toInt(),

    body("classId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Class must be a positive integer.")
        .toInt(),

    body("attendanceDate")
        .optional()
        .isISO8601()
        .withMessage("Attendance date must be a valid date."),

    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage(
            `Attendance status must be one of: ${STATUS_VALUES.join(", ")}.`
        ),

    body("remarks")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Remarks cannot exceed 500 characters."),
];

exports.bulkAttendance = [
    body("academicYearId")
        .notEmpty()
        .withMessage("Academic year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic year must be a positive integer.")
        .toInt(),

    body("termId")
        .notEmpty()
        .withMessage("Term is required.")
        .isInt({ min: 1 })
        .withMessage("Term must be a positive integer.")
        .toInt(),

    body("classId")
        .notEmpty()
        .withMessage("Class is required.")
        .isInt({ min: 1 })
        .withMessage("Class must be a positive integer.")
        .toInt(),

    body("attendanceDate")
        .notEmpty()
        .withMessage("Attendance date is required.")
        .isISO8601()
        .withMessage("Attendance date must be a valid date."),

    body("action")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(BULK_ACTIONS)
        .withMessage(
            `Bulk action must be one of: ${BULK_ACTIONS.join(", ")}.`
        ),

    body("entries")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Entries must be a non-empty array."),

    body("entries.*.studentId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Each entry studentId must be a positive integer.")
        .toInt(),

    body("entries.*.status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage(
            `Each entry status must be one of: ${STATUS_VALUES.join(", ")}.`
        ),

    body("entries.*.remarks")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Remarks cannot exceed 500 characters."),
];
