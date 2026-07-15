const { body } = require("express-validator");

exports.createEventValidator = [
    body("title")
    .notEmpty()
    .withMessage("Event title is required."),

    body("description")
    .notEmpty()
    .withMessage("Event description is required."),

    body("eventDate")
    .isISO8601()
    .withMessage("A valid event date is required."),

    body("venue")
    .notEmpty()
    .withMessage("Venue is required."),
];