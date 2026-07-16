const express = require("express");

const {
    getNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
} = require("../controllers/notification.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createNotificationValidator,
    updateNotificationValidator,
} = require("../validators/notification.validator");

const router = express.Router();

router.get("/", authenticate, getNotifications);

router.get("/:id", authenticate, getNotificationById);

router.post(
    "/",
    authenticate,
    createNotificationValidator,
    validate,
    createNotification
);

router.put(
    "/:id",
    authenticate,
    updateNotificationValidator,
    validate,
    updateNotification
);

router.delete(
    "/:id",
    authenticate,
    deleteNotification
);

module.exports = router;