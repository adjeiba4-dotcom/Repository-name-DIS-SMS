// validators/notification.validator.js

const { body, param, query } = require("express-validator");

const createNotificationValidator = [
  body("userId")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer."),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 200 }),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({ max: 5000 }),
  body("type")
    .optional()
    .trim()
    .isIn(["INFO", "SUCCESS", "WARNING", "ERROR"]),
  body("channel")
    .optional()
    .trim()
    .isIn(["IN_APP", "EMAIL", "SMS"]),
  body("entityType").optional({ nullable: true }).trim().isLength({ max: 100 }),
  body("entityId").optional({ nullable: true }).isInt({ min: 1 }),
];

const updateNotificationValidator = [
  param("id").isInt({ min: 1 }),
  body("title").optional().trim().notEmpty().isLength({ max: 200 }),
  body("message").optional().trim().notEmpty().isLength({ max: 5000 }),
  body("type")
    .optional()
    .trim()
    .isIn(["INFO", "SUCCESS", "WARNING", "ERROR"]),
  body("channel")
    .optional()
    .trim()
    .isIn(["IN_APP", "EMAIL", "SMS"]),
  body("status")
    .optional()
    .trim()
    .isIn(["PENDING", "SENT", "FAILED", "READ"]),
];

const listNotifications = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("isRead").optional().isIn(["true", "false"]),
  query("type").optional().isIn(["INFO", "SUCCESS", "WARNING", "ERROR"]),
  query("channel").optional().isIn(["IN_APP", "EMAIL", "SMS"]),
];

const validateNotificationId = [
  param("id").isInt({ min: 1 }).withMessage("Notification ID must be a positive integer."),
];

module.exports = {
  createNotificationValidator,
  updateNotificationValidator,
  listNotifications,
  validateNotificationId,
};
