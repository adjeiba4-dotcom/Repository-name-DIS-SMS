// routes/notification.routes.js

const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const {
  createNotificationValidator,
  updateNotificationValidator,
  listNotifications,
  validateNotificationId,
} = require("../validators/notification.validator");
const { validate } = require("../middleware/validation.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   - name: Notifications
 *     description: In-app notification framework (email/SMS ready)
 */

router.get(
  "/",
  authenticate,
  listNotifications,
  validate,
  notificationController.getNotifications
);

router.get(
  "/unread-count",
  authenticate,
  notificationController.getUnreadCount
);

router.post(
  "/mark-all-read",
  authenticate,
  notificationController.markAllAsRead
);

router.get(
  "/:id",
  authenticate,
  validateNotificationId,
  validate,
  notificationController.getNotificationById
);

router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMINISTRATOR, ROLES.HEADMASTER),
  createNotificationValidator,
  validate,
  notificationController.createNotification
);

router.patch(
  "/:id/read",
  authenticate,
  validateNotificationId,
  validate,
  notificationController.markAsRead
);

router.put(
  "/:id",
  authenticate,
  authorize(ROLES.ADMINISTRATOR, ROLES.HEADMASTER),
  updateNotificationValidator,
  validate,
  notificationController.updateNotification
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMINISTRATOR),
  validateNotificationId,
  validate,
  notificationController.deleteNotification
);

module.exports = router;
