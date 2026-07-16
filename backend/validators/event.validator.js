const { body } = require("express-validator");

exports.createEventValidator = [
    body("title")
    .trim()
    .notEmpty()
    .withMessage("Event title is required."),

    body("venue")
    .trim()
    .notEmpty()
    .withMessage("Venue is required."),

    body("eventDate")
    .isISO8601()
    .withMessage("A valid event date is required."),

    body("startTime")
    .isISO8601()
    .withMessage("A valid start time is required."),

    body("endTime")
    .isISO8601()
    .withMessage("A valid end time is required."),

    body("description")
    .optional()
    .isString()
    .withMessage("Description must be text."),

    body("status")
    .optional()
    .isIn(["Scheduled", "Completed", "Cancelled"])
    .withMessage(
        "Status must be Scheduled, Completed or Cancelled."
    ),
];

exports.updateEventValidator = [
    body("title")
    .optional()
    .trim()
    .notEmpty(),

    body("venue")
    .optional()
    .trim()
    .notEmpty(),

    body("eventDate")
    .optional()
    .isISO8601(),

    body("startTime")
    .optional()
    .isISO8601(),

    body("endTime")
    .optional()
    .isISO8601(),

    body("description")
    .optional()
    .isString(),

    body("status")
    .optional()
    .isIn(["Scheduled", "Completed", "Cancelled"]),
];