const { body, param, query } = require("express-validator");

/**
 * Create Class Validation
 */
exports.createClass = [
    body("code")
    .trim()
    .notEmpty()
    .withMessage("Class code is required.")
    .isLength({ max: 20 })
    .withMessage("Class code must not exceed 20 characters."),

    body("name")
    .trim()
    .notEmpty()
    .withMessage("Class name is required.")
    .isLength({ max: 100 })
    .withMessage("Class name must not exceed 100 characters."),

    body("level")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Level must not exceed 50 characters."),

    body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer."),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters.")
];

/**
 * Update Class Validation
 */
exports.updateClass = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid class ID."),

    body("code")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Class code cannot be empty.")
    .isLength({ max: 20 })
    .withMessage("Class code must not exceed 20 characters."),

    body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Class name cannot be empty.")
    .isLength({ max: 100 })
    .withMessage("Class name must not exceed 100 characters."),

    body("level")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Level must not exceed 50 characters."),

    body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer."),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters.")
];

/**
 * Validate Class ID
 */
exports.validateClassId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid class ID.")
];

/**
 * Search Class Validation
 */
exports.searchClass = [
    query("keyword")
    .trim()
    .notEmpty()
    .withMessage("Search keyword is required.")
];