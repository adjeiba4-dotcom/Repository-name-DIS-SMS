const express = require("express");

const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
} = require("../controllers/event.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const {
    createEventValidator,
    updateEventValidator,
} = require("../validators/event.validator");

const router = express.Router();

router.get("/", authenticate, getEvents);

router.get("/:id", authenticate, getEventById);

router.post(
    "/",
    authenticate,
    createEventValidator,
    validate,
    createEvent
);

router.put(
    "/:id",
    authenticate,
    updateEventValidator,
    validate,
    updateEvent
);

router.delete(
    "/:id",
    authenticate,
    deleteEvent
);

module.exports = router;