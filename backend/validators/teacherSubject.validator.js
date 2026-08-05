// validators/teacherSubject.validator.js

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

exports.createTeacherSubject = [
    body("teacherId")
        .notEmpty()
        .withMessage("Teacher is required.")
        .isInt({ min: 1 })
        .withMessage("Teacher ID must be a valid integer.")
        .toInt(),

    body("subjectId")
        .notEmpty()
        .withMessage("Subject is required.")
        .isInt({ min: 1 })
        .withMessage("Subject ID must be a valid integer.")
        .toInt(),

    body("academicYearId")
        .notEmpty()
        .withMessage("Academic year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic year ID must be a valid integer.")
        .toInt(),

    optionalNullableInt("termId"),

    body("isPrimary")
        .optional()
        .isBoolean()
        .withMessage("isPrimary must be true or false.")
        .toBoolean(),

    body("weeklyPeriods")
        .notEmpty()
        .withMessage("Weekly periods are required.")
        .isInt({ min: 1 })
        .withMessage("Weekly periods must be greater than 0.")
        .toInt(),

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

exports.updateTeacherSubject = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid assignment ID.")
        .toInt(),

    body("teacherId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Teacher ID must be a valid integer.")
        .toInt(),

    body("subjectId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Subject ID must be a valid integer.")
        .toInt(),

    body("academicYearId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Academic year ID must be a valid integer.")
        .toInt(),

    optionalNullableInt("termId"),

    body("isPrimary")
        .optional()
        .isBoolean()
        .withMessage("isPrimary must be true or false.")
        .toBoolean(),

    body("weeklyPeriods")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Weekly periods must be greater than 0.")
        .toInt(),

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

exports.validateTeacherSubjectId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid assignment ID.")
        .toInt(),
];

exports.listTeacherSubjects = [
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

    query("teacherId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Teacher ID must be a valid integer.")
        .toInt(),

    query("subjectId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Subject ID must be a valid integer.")
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

    query("isPrimary")
        .optional()
        .isIn(["true", "false", "1", "0"])
        .withMessage("isPrimary must be true or false."),

    query("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),

    query("sortBy")
        .optional()
        .isIn([
            "createdAt",
            "updatedAt",
            "weeklyPeriods",
            "isPrimary",
            "status",
            "teacherId",
            "subjectId",
            "academicYearId",
            "termId",
        ])
        .withMessage("Invalid sort field."),

    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc."),
];

exports.restoreTeacherSubject = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid assignment ID.")
        .toInt(),

    body("activate")
        .optional()
        .isBoolean()
        .withMessage("activate must be true or false.")
        .toBoolean(),
];
