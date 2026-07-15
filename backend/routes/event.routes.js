const express = require("express");
const { getEvents } = require("../controllers/event.controller");
const { createEvent } = require("../controllers/event.create.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const { createEventValidator } = require("../validators/event.validator");

const router = express.Router();

router.get("/", authenticate, getEvents);

router.post(
    "/",
    authenticate,
    createEventValidator,
    validate,
    createEvent
);

module.exports = router;