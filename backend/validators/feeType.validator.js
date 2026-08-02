// validators/feeType.validator.js

const { body, param, query } = require("express-validator");

const createFeeType = [
    body("code")
    .trim()
    .notEmpty()
    .withMessage("Fee type code is required.")
    .isLength({ max: 50 })
    .withMessage("Fee type code must not exceed 50 characters."),

    body("name")
    .trim()
    .notEmpty()
    .withMessage("Fee type name is required.")
    .isLength({ max: 100 })
    .withMessage("Fee type name must not exceed 100 characters."),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters."),

    body("mandatory")
    .optional()
    .isBoolean()
    .withMessage("Mandatory must be true or false."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

const updateFeeType = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid Fee Type ID is required."),

    body("code")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Fee type code must not exceed 50 characters."),

    body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Fee type name must not exceed 100 characters."),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description must not exceed 255 characters."),

    body("mandatory")
    .optional()
    .isBoolean()
    .withMessage("Mandatory must be true or false."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

const validateFeeTypeId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid Fee Type ID is required."),
];

const searchFeeTypes = [
    query("keyword")
    .optional()
    .trim(),
];

module.exports = {
    createFeeType,
    updateFeeType,
    validateFeeTypeId,
    searchFeeTypes,
};