// validators/enrollment.validator.js

const { body, param, query } = require("express-validator");

exports.createEnrollment = [
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

    body("classId")
    .notEmpty()
    .withMessage("School class is required.")
    .isInt({ min: 1 })
    .withMessage("Class ID must be a positive integer."),

    body("enrollmentDate")
    .notEmpty()
    .withMessage("Enrollment date is required.")
    .isISO8601()
    .withMessage("Enrollment date must be a valid date."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
    .withMessage(
        "Status must be ACTIVE, INACTIVE or ARCHIVED."
    ),
];

exports.updateEnrollment = [
    body("studentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Student ID must be a positive integer."),

    body("academicYearId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Academic Year ID must be a positive integer."),

    body("classId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Class ID must be a positive integer."),

    body("enrollmentDate")
    .optional()
    .isISO8601()
    .withMessage("Enrollment date must be a valid date."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
    .withMessage(
        "Status must be ACTIVE, INACTIVE or ARCHIVED."
    ),
];

exports.validateEnrollmentId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Enrollment ID must be a positive integer."),
];

exports.searchEnrollment = [
    query("keyword")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage(
        "Search keyword must contain at least one character."
    ),
];