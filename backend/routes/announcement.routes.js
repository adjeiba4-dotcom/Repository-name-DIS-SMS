const express = require("express");

const {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
} = require("../controllers/announcement.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createAnnouncementValidator,
    updateAnnouncementValidator,
} = require("../validators/announcement.validator");

const router = express.Router();

router.get("/", authenticate, getAnnouncements);

router.get("/:id", authenticate, getAnnouncementById);

router.post(
    "/",
    authenticate,
    createAnnouncementValidator,
    validate,
    createAnnouncement
);

router.put(
    "/:id",
    authenticate,
    updateAnnouncementValidator,
    validate,
    updateAnnouncement
);

router.delete(
    "/:id",
    authenticate,
    deleteAnnouncement
);

module.exports = router;