// validators/dashboard.validator.js

const { body, param, query } = require("express-validator");

const createDashboard = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Dashboard name is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Dashboard name must be between 3 and 100 characters."),

    body("description")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

    body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be true or false."),

    body("createdBy")
    .notEmpty()
    .withMessage("Created By is required.")
    .isInt({ min: 1 })
    .withMessage("Created By must be a valid user ID."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be either ACTIVE or INACTIVE."),
];

const updateDashboard = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Dashboard ID must be a valid integer."),

    body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Dashboard name must be between 3 and 100 characters."),

    body("description")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

    body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be true or false."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be either ACTIVE or INACTIVE."),
];

const validateDashboardId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Dashboard ID must be a valid integer."),
];

const searchDashboards = [
    query("keyword")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Search keyword cannot exceed 100 characters."),
];

module.exports = {
    createDashboard,
    updateDashboard,
    validateDashboardId,
    searchDashboards,
};