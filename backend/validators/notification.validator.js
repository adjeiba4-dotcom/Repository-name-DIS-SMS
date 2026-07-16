const { body } = require("express-validator");

exports.createNotificationValidator = [
    body("title")
    .trim()
    .notEmpty()
    .withMessage("Notification title is required."),

    body("message")
    .trim()
    .notEmpty()
    .withMessage("Notification message is required."),

    body("recipient")
    .trim()
    .notEmpty()
    .withMessage("Recipient is required."),

    body("isRead")
    .optional()
    .isBoolean()
    .withMessage("isRead must be true or false."),
];

exports.updateNotificationValidator = [
    body("title")
    .optional()
    .trim()
    .notEmpty(),

    body("message")
    .optional()
    .trim()
    .notEmpty(),

    body("recipient")
    .optional()
    .trim()
    .notEmpty(),

    body("isRead")
    .optional()
    .isBoolean(),
];