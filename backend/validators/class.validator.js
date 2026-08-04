// validators/class.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];

exports.createClass = [
    body("classCode")
        .trim()
        .notEmpty()
        .withMessage("Class code is required.")
        .isLength({ max: 50 })
        .withMessage("Class code must not exceed 50 characters."),

    body("className")
        .trim()
        .notEmpty()
        .withMessage("Class name is required.")
        .isLength({ max: 100 })
        .withMessage("Class name must not exceed 100 characters."),

    body("academicYearId")
        .notEmpty()
        .withMessage("Academic Year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic Year ID must be a valid integer.")
        .toInt(),

    body("departmentId")
        .optional({ nullable: true })
        .customSanitizer((value) =>
            value === "" || value === null || value === undefined
                ? null
                : value
        )
        .custom((value) => value === null || Number.isInteger(Number(value)))
        .withMessage("Department ID must be a valid integer.")
        .customSanitizer((value) =>
            value === null ? null : parseInt(value, 10)
        ),

    body("classTeacherId")
        .optional({ nullable: true })
        .customSanitizer((value) =>
            value === "" || value === null || value === undefined
                ? null
                : value
        )
        .custom((value) => value === null || Number.isInteger(Number(value)))
        .withMessage("Class teacher ID must be a valid integer.")
        .customSanitizer((value) =>
            value === null ? null : parseInt(value, 10)
        ),

    body("capacity")
        .notEmpty()
        .withMessage("Capacity is required.")
        .isInt({ min: 1 })
        .withMessage("Capacity must be greater than 0.")
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

exports.updateClass = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid class ID.")
        .toInt(),

    body("classCode")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Class code cannot be empty.")
        .isLength({ max: 50 })
        .withMessage("Class code must not exceed 50 characters."),

    body("className")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Class name cannot be empty.")
        .isLength({ max: 100 })
        .withMessage("Class name must not exceed 100 characters."),

    body("academicYearId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Academic Year ID must be a valid integer.")
        .toInt(),

    body("departmentId")
        .optional({ nullable: true })
        .customSanitizer((value) =>
            value === "" || value === null || value === undefined
                ? null
                : value
        )
        .custom((value) => value === null || Number.isInteger(Number(value)))
        .withMessage("Department ID must be a valid integer.")
        .customSanitizer((value) =>
            value === null ? null : parseInt(value, 10)
        ),

    body("classTeacherId")
        .optional({ nullable: true })
        .customSanitizer((value) =>
            value === "" || value === null || value === undefined
                ? null
                : value
        )
        .custom((value) => value === null || Number.isInteger(Number(value)))
        .withMessage("Class teacher ID must be a valid integer.")
        .customSanitizer((value) =>
            value === null ? null : parseInt(value, 10)
        ),

    body("capacity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Capacity must be greater than 0.")
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

exports.validateClassId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid class ID.")
        .toInt(),
];

exports.listClasses = [
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

    query("academicYearId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Academic Year ID must be a valid integer.")
        .toInt(),

    query("departmentId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Department ID must be a valid integer.")
        .toInt(),

    query("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),

    query("sortBy")
        .optional()
        .isIn([
            "className",
            "classCode",
            "capacity",
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

exports.restoreClass = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid class ID.")
        .toInt(),

    body("activate")
        .optional()
        .isBoolean()
        .withMessage("activate must be true or false.")
        .toBoolean(),
];
