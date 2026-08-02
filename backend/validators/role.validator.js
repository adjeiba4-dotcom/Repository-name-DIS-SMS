// validators/role.validator.js

const { body } = require("express-validator");

/**
 * Create Role Validation
 */
exports.createRole = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Role name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Role name must be between 2 and 100 characters."),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description cannot exceed 255 characters."),
];

/**
 * Update Role Validation
 */
exports.updateRole = [
    body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Role name must be between 2 and 100 characters."),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description cannot exceed 255 characters."),
];