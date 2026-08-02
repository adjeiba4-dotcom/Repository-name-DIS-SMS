const { body, param, query } = require("express-validator");

/**
 * Create Academic Year Validation
 */
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

    body("isCurrent")
    .optional()
    .isBoolean()
    .withMessage("isCurrent must be true or false.")
];

/**
 * Update Academic Year Validation
 */
exports.updateAcademicYear = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid academic year ID."),

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

    body("isCurrent")
    .optional()
    .isBoolean()
    .withMessage("isCurrent must be true or false.")
];

/**
 * Validate Academic Year ID
 */
exports.validateAcademicYearId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid academic year ID.")
];

/**
 * Search Academic Year Validation
 */
exports.searchAcademicYear = [
    query("keyword")
    .trim()
    .notEmpty()
    .withMessage("Search keyword is required.")
];