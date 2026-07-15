const express = require("express");
const { getAnnouncements } = require("../controllers/announcement.controller");
const { createAnnouncement } = require("../controllers/announcement.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createAnnouncementValidator } = require("../validators/announcement.validator");

const router = express.Router();

router.get("/", authenticate, getAnnouncements);

router.post(
    "/",
    authenticate,
    createAnnouncementValidator,
    validate,
    createAnnouncement
);

module.exports = router;