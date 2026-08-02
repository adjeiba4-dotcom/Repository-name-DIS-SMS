// validators/attendance.validator.js

const { body, param, query } = require("express-validator");

exports.createAttendance = [
    body("studentId")
    .notEmpty()
    .withMessage("Student is required.")
    .isInt({ min: 1 })
    .withMessage("Student ID must be a positive integer."),

    body("academicYearId")
    .notEmpty()
    .withMessage("Academic year is required.")
    .isInt({ min: 1 })
    .withMessage("Academic Year ID must be a positive integer."),

    body("termId")
    .notEmpty()
    .withMessage("Term is required.")
    .isInt({ min: 1 })
    .withMessage("Term ID must be a positive integer."),

    body("attendanceDate")
    .notEmpty()
    .withMessage("Attendance date is required.")
    .isISO8601()
    .withMessage("Attendance date must be a valid date."),

    body("status")
    .notEmpty()
    .withMessage("Attendance status is required.")
    .isIn([
        "PRESENT",
        "ABSENT",
        "LATE",
        "EXCUSED",
    ])
    .withMessage(
        "Attendance status must be PRESENT, ABSENT, LATE or EXCUSED."
    ),

    body("remarks")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Remarks cannot exceed 500 characters."
    ),
];

exports.updateAttendance = [
    body("studentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Student ID must be a positive integer."),

    body("academicYearId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Academic Year ID must be a positive integer."),

    body("termId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Term ID must be a positive integer."),

    body("attendanceDate")
    .optional()
    .isISO8601()
    .withMessage("Attendance date must be a valid date."),

    body("status")
    .optional()
    .isIn([
        "PRESENT",
        "ABSENT",
        "LATE",
        "EXCUSED",
    ])
    .withMessage(
        "Attendance status must be PRESENT, ABSENT, LATE or EXCUSED."
    ),

    body("remarks")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Remarks cannot exceed 500 characters."
    ),
];

exports.validateAttendanceId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage(
        "Attendance ID must be a positive integer."
    ),
];

exports.searchAttendance = [
    query("keyword")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage(
        "Search keyword must contain at least one character."
    ),
];