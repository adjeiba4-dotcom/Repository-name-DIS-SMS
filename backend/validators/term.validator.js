// validators/term.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];

exports.createTerm = [
    body("academicYearId")
        .notEmpty()
        .withMessage("Academic Year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic Year ID must be a valid integer.")
        .toInt(),

    body("code")
        .trim()
        .notEmpty()
        .withMessage("Term code is required.")
        .isLength({ max: 50 })
        .withMessage("Term code must not exceed 50 characters."),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Term name is required.")
        .isLength({ max: 100 })
        .withMessage("Term name cannot exceed 100 characters."),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters."),

    body("startDate")
        .notEmpty()
        .withMessage("Start date is required.")
        .isISO8601()
        .withMessage("Start date must be a valid date."),

    body("endDate")
        .notEmpty()
        .withMessage("End date is required.")
        .isISO8601()
        .withMessage("End date must be a valid date."),

    body("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.updateTerm = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid term ID.")
        .toInt(),

    body("academicYearId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Academic Year ID must be a valid integer.")
        .toInt(),

    body("code")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Term code cannot be empty.")
        .isLength({ max: 50 })
        .withMessage("Term code must not exceed 50 characters."),

    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Term name cannot be empty.")
        .isLength({ max: 100 })
        .withMessage("Term name cannot exceed 100 characters."),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters."),

    body("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid date."),

    body("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid date."),

    body("status")
        .optional()
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.validateTermId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid term ID.")
        .toInt(),
];

exports.listTerms = [
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
];

exports.restoreTerm = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid term ID.")
        .toInt(),

    body("activate")
        .optional()
        .isBoolean()
        .withMessage("activate must be true or false.")
        .toBoolean(),
];
