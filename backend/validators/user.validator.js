const { body } = require("express-validator");

const STATUS = ["ACTIVE", "INACTIVE", "ARCHIVED"];

exports.createUserValidator = [
    body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required."),

    body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required."),

    body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required."),

    body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),

    body("roleId")
    .isInt({ min: 1 })
    .withMessage("Valid roleId is required."),

    body("status")
    .optional()
    .isIn(STATUS)
    .withMessage("Invalid status."),
];

exports.updateUserValidator = [
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim().notEmpty(),

    body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required."),

    body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),

    body("roleId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Valid roleId is required."),

    body("status")
    .optional()
    .isIn(STATUS)
    .withMessage("Invalid status."),
];