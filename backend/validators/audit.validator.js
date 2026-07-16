const { body } = require("express-validator");

exports.createAuditValidator = [
    body("userId")
    .isInt()
    .withMessage("User ID is required."),

    body("action")
    .trim()
    .notEmpty()
    .withMessage("Action is required."),

    body("tableName")
    .trim()
    .notEmpty()
    .withMessage("Table name is required."),

    body("recordId")
    .optional()
    .isInt()
    .withMessage("Record ID must be an integer."),

    body("ipAddress")
    .optional()
    .isIP()
    .withMessage("IP address must be valid."),
];