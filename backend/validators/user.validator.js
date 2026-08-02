// validators/user.validator.js

const { body } = require("express-validator");

/**
 * Create User Validation
 */
exports.createUser = [
    body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("First name must be between 2 and 100 characters."),

    body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Last name must be between 2 and 100 characters."),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),

    body("roleId")
    .notEmpty()
    .withMessage("Role is required.")
    .isInt({ min: 1 })
    .withMessage("Role ID must be a valid integer."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be either ACTIVE or INACTIVE."),
];

/**
 * Update User Validation
 */
exports.updateUser = [
    body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("First name must be between 2 and 100 characters."),

    body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Last name must be between 2 and 100 characters."),

    body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .normalizeEmail(),

    body("roleId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Role ID must be a valid integer."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be either ACTIVE or INACTIVE."),
];

/**
 * Change Password Validation
 */
exports.changePassword = [
    body("password")
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
];