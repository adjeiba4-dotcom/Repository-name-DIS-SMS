// validators/subject.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const CATEGORY_VALUES = ["CORE", "ELECTIVE"];

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

exports.createSubject = [
    body("subjectCode")
        .trim()
        .notEmpty()
        .withMessage("Subject code is required.")
        .isLength({ max: 50 })
        .withMessage("Subject code must not exceed 50 characters."),

    body("subjectName")
        .trim()
        .notEmpty()
        .withMessage("Subject name is required.")
        .isLength({ max: 150 })
        .withMessage("Subject name must not exceed 150 characters."),

    body("shortName")
        .trim()
        .notEmpty()
        .withMessage("Short name is required.")
        .isLength({ max: 50 })
        .withMessage("Short name must not exceed 50 characters."),

    optionalNullableInt("departmentId"),

    optionalNullableInt("schoolClassId"),

    body("category")
        .optional()
        .trim()
        .toUpperCase()
        .isIn(CATEGORY_VALUES)
        .withMessage("Category must be CORE or ELECTIVE."),

    body("creditHours")
        .notEmpty()
        .withMessage("Credit hours are required.")
        .isInt({ min: 1 })
        .withMessage("Credit hours must be greater than 0.")
        .toInt(),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters."),

    body("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.updateSubject = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid subject ID.")
        .toInt(),

    body("subjectCode")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Subject code cannot be empty.")
        .isLength({ max: 50 })
        .withMessage("Subject code must not exceed 50 characters."),

    body("subjectName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Subject name cannot be empty.")
        .isLength({ max: 150 })
        .withMessage("Subject name must not exceed 150 characters."),

    body("shortName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Short name cannot be empty.")
        .isLength({ max: 50 })
        .withMessage("Short name must not exceed 50 characters."),

    optionalNullableInt("departmentId"),

    optionalNullableInt("schoolClassId"),

    body("category")
        .optional()
        .trim()
        .toUpperCase()
        .isIn(CATEGORY_VALUES)
        .withMessage("Category must be CORE or ELECTIVE."),

    body("creditHours")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Credit hours must be greater than 0.")
        .toInt(),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters."),

    body("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.validateSubjectId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid subject ID.")
        .toInt(),
];

exports.listSubjects = [
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

    query("departmentId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Department ID must be a valid integer.")
        .toInt(),

    query("schoolClassId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Class ID must be a valid integer.")
        .toInt(),

    query("category")
        .optional()
        .trim()
        .toUpperCase()
        .isIn(CATEGORY_VALUES)
        .withMessage("Category must be CORE or ELECTIVE."),

    query("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),

    query("sortBy")
        .optional()
        .isIn([
            "subjectName",
            "subjectCode",
            "shortName",
            "category",
            "creditHours",
            "status",
            "createdAt",
            "updatedAt",
        ])
        .withMessage("Invalid sort field."),

    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc."),
];

exports.restoreSubject = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid subject ID.")
        .toInt(),

    body("activate")
        .optional()
        .isBoolean()
        .withMessage("activate must be true or false.")
        .toBoolean(),
];
