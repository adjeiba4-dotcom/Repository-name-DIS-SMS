// validators/term.validator.js

const { body, param, query } = require("express-validator");

exports.createTerm = [
    body("academicYearId")
    .notEmpty()
    .withMessage("Academic Year is required.")
    .isInt({ min: 1 })
    .withMessage("Academic Year ID must be a valid integer."),

    body("name")
    .trim()
    .notEmpty()
    .withMessage("Term name is required.")
    .isLength({ max: 100 })
    .withMessage("Term name cannot exceed 100 characters."),

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

    body("isCurrent")
    .optional()
    .isBoolean()
    .withMessage("isCurrent must be true or false."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.updateTerm = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Term ID must be a valid integer."),

    body("academicYearId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Academic Year ID must be a valid integer."),

    body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Term name cannot be empty.")
    .isLength({ max: 100 })
    .withMessage("Term name cannot exceed 100 characters."),

    body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date."),

    body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date."),

    body("isCurrent")
    .optional()
    .isBoolean()
    .withMessage("isCurrent must be true or false."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.validateTermId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Term ID must be a valid integer."),
];

exports.searchTerm = [
    query("keyword")
    .trim()
    .notEmpty()
    .withMessage("Search keyword is required.")
    .isLength({ max: 100 })
    .withMessage("Keyword cannot exceed 100 characters."),
];