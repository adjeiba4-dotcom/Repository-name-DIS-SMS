const { body, param, query } = require("express-validator");

exports.createDepartment = [
    body("code")
    .trim()
    .notEmpty()
    .withMessage("Department code is required.")
    .isLength({ max: 20 })
    .withMessage("Department code must not exceed 20 characters."),

    body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required.")
    .isLength({ max: 100 })
    .withMessage("Department name must not exceed 100 characters."),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters.")
];

exports.updateDepartment = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid department ID."),

    body("code")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department code cannot be empty.")
    .isLength({ max: 20 })
    .withMessage("Department code must not exceed 20 characters."),

    body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Department name cannot be empty.")
    .isLength({ max: 100 })
    .withMessage("Department name must not exceed 100 characters."),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters.")
];

exports.validateDepartmentId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid department ID.")
];

exports.searchDepartment = [
    query("keyword")
    .trim()
    .notEmpty()
    .withMessage("Search keyword is required.")
];