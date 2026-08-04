// validators/academicYear.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];

exports.createAcademicYear = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Academic year name is required.")
        .isLength({ max: 100 })
        .withMessage("Academic year name must not exceed 100 characters."),

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

exports.updateAcademicYear = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid academic year ID.")
        .toInt(),

    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Academic year name cannot be empty.")
        .isLength({ max: 100 })
        .withMessage("Academic year name must not exceed 100 characters."),

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

exports.validateAcademicYearId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid academic year ID.")
        .toInt(),
];

exports.listAcademicYears = [
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
];

exports.restoreAcademicYear = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid academic year ID.")
        .toInt(),

    body("activate")
        .optional()
        .isBoolean()
        .withMessage("activate must be true or false.")
        .toBoolean(),
];
