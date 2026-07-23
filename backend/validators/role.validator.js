const { body, param } = require("express-validator");

const createRoleValidator = [
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

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

const updateRoleValidator = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid role ID is required."),

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

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
    .withMessage("Status must be ACTIVE, INACTIVE or ARCHIVED."),
];

const roleIdValidator = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid role ID is required."),
];

module.exports = {
    createRoleValidator,
    updateRoleValidator,
    roleIdValidator,
};