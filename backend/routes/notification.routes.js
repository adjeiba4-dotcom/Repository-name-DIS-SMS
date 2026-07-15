const express = require("express");
const { getNotifications } = require("../controllers/notification.controller");
const {
    createNotification,
} = require("../controllers/notification.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const {
    createNotificationValidator,
} = require("../validators/notification.validator");

const router = express.Router();

router.get("/", authenticate, getNotifications);

router.post(
    "/",
    authenticate,
    createNotificationValidator,
    validate,
    createNotification
);

module.exports = router;