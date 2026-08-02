// validators/settings.validator.js

const {
    body,
    param,
    query,
} = require("express-validator");

/**
 * Validate Setting ID
 */
const validateSettingId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage(
        "Setting ID must be a positive integer."
    ),
];

/**
 * Create Setting
 */
const createSetting = [
    body("settingKey")
    .trim()
    .notEmpty()
    .withMessage(
        "Setting key is required."
    )
    .isLength({ max: 100 })
    .withMessage(
        "Setting key cannot exceed 100 characters."
    ),

    body("settingValue")
    .notEmpty()
    .withMessage(
        "Setting value is required."
    ),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Description cannot exceed 500 characters."
    ),
];

/**
 * Update Setting
 */
const updateSetting = [
    body("settingKey")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
        "Setting key cannot be empty."
    )
    .isLength({ max: 100 })
    .withMessage(
        "Setting key cannot exceed 100 characters."
    ),

    body("settingValue")
    .optional()
    .notEmpty()
    .withMessage(
        "Setting value cannot be empty."
    ),

    body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Description cannot exceed 500 characters."
    ),
];

/**
 * Search Settings
 */
const searchSettings = [
    query("keyword")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage(
        "Keyword cannot be empty."
    ),
];

module.exports = {
    validateSettingId,
    createSetting,
    updateSetting,
    searchSettings,
};