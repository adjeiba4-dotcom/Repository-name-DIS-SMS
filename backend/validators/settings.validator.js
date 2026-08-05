// validators/settings.validator.js

const { body, param, query } = require("express-validator");

const validateSettingId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Setting ID must be a positive integer."),
];

const validateSettingKey = [
  param("key")
    .trim()
    .notEmpty()
    .withMessage("Setting key is required.")
    .isLength({ max: 120 })
    .withMessage("Setting key cannot exceed 120 characters."),
];

const createSetting = [
  body("settingKey")
    .trim()
    .notEmpty()
    .withMessage("Setting key is required.")
    .isLength({ max: 120 })
    .withMessage("Setting key cannot exceed 120 characters."),
  body("settingValue").notEmpty().withMessage("Setting value is required."),
  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
  body("category").optional({ nullable: true }).trim().isLength({ max: 50 }),
  body("dataType")
    .optional()
    .trim()
    .isIn(["STRING", "NUMBER", "BOOLEAN", "JSON"])
    .withMessage("dataType must be STRING, NUMBER, BOOLEAN, or JSON."),
  body("isSystem").optional().isBoolean(),
];

const updateSetting = [
  body("settingKey")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Setting key cannot be empty.")
    .isLength({ max: 120 }),
  body("settingValue")
    .optional()
    .notEmpty()
    .withMessage("Setting value cannot be empty."),
  body("description").optional({ nullable: true }).trim().isLength({ max: 500 }),
  body("category").optional({ nullable: true }).trim().isLength({ max: 50 }),
  body("dataType")
    .optional()
    .trim()
    .isIn(["STRING", "NUMBER", "BOOLEAN", "JSON"]),
  body("isSystem").optional().isBoolean(),
];

const upsertSettings = [
  body().custom((value, { req }) => {
    const entries = Array.isArray(req.body)
      ? req.body
      : req.body?.settings;
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error("settings must be a non-empty array.");
    }
    return true;
  }),
];

const listSettings = [
  query("category").optional().trim(),
  query("search").optional().trim(),
  query("keyword").optional().trim(),
];

module.exports = {
  validateSettingId,
  validateSettingKey,
  createSetting,
  updateSetting,
  upsertSettings,
  listSettings,
};
