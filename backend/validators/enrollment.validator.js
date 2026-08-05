// validators/enrollment.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];

const optionalNullableInt = (field) =>
    body(field)
        .optional({ nullable: true })
        .customSanitizer((value) =>
            value === "" || value === null || value === undefined
                ? null
                : value
        )
        .custom((value) => value === null || Number.isInteger(Number(value)))
        .withMessage(`${field} must be a valid integer.`)
        .customSanitizer((value) =>
            value === null ? null : parseInt(value, 10)
        );

exports.createEnrollment = [
    body("studentId")
        .notEmpty()
        .withMessage("Student is required.")
        .isInt({ min: 1 })
        .withMessage("Student ID must be a valid integer.")
        .toInt(),

    body("schoolClassId")
        .notEmpty()
        .withMessage("Class is required.")
        .isInt({ min: 1 })
        .withMessage("Class ID must be a valid integer.")
        .toInt(),

    body("academicYearId")
        .notEmpty()
        .withMessage("Academic year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic year ID must be a valid integer.")
        .toInt(),

    optionalNullableInt("termId"),

    body("enrollmentDate")
        .optional()
        .isISO8601()
        .withMessage("Enrollment date must be a valid date."),

    body("remarks")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Remarks cannot exceed 500 characters."),

    body("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.updateEnrollment = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid enrollment ID.")
        .toInt(),

    body("studentId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Student ID must be a valid integer.")
        .toInt(),

    body("schoolClassId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Class ID must be a valid integer.")
        .toInt(),

    body("academicYearId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Academic year ID must be a valid integer.")
        .toInt(),

    optionalNullableInt("termId"),

    body("enrollmentDate")
        .optional()
        .isISO8601()
        .withMessage("Enrollment date must be a valid date."),

    body("remarks")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Remarks cannot exceed 500 characters."),

    body("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.validateEnrollmentId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid enrollment ID.")
        .toInt(),
];

exports.listEnrollments = [
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

    query("search")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Search keyword cannot exceed 100 characters."),

    query("keyword")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Search keyword cannot exceed 100 characters."),

    query("studentId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Student ID must be a valid integer.")
        .toInt(),

    query("schoolClassId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Class ID must be a valid integer.")
        .toInt(),

    query("classId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Class ID must be a valid integer.")
        .toInt(),

    query("academicYearId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Academic year ID must be a valid integer.")
        .toInt(),

    query("termId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Term ID must be a valid integer.")
        .toInt(),

    query("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),

    query("sortBy")
        .optional()
        .isIn([
            "createdAt",
            "updatedAt",
            "enrollmentDate",
            "enrollmentNumber",
            "status",
            "studentId",
            "schoolClassId",
            "academicYearId",
            "termId",
        ])
        .withMessage("Invalid sort field."),

    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc."),
];

exports.restoreEnrollment = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid enrollment ID.")
        .toInt(),

    body("activate")
        .optional()
        .isBoolean()
        .withMessage("activate must be true or false.")
        .toBoolean(),
];
