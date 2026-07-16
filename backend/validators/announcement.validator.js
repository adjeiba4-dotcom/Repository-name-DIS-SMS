const { body } = require("express-validator");

exports.createAnnouncementValidator = [
    body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required."),

    body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required."),

    body("audience")
    .trim()
    .notEmpty()
    .withMessage("Audience is required."),

    body("publishDate")
    .isISO8601()
    .withMessage("A valid publish date is required."),

    body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Expiry date must be valid."),

    body("status")
    .optional()
    .isIn(["Published", "Draft", "Archived"])
    .withMessage(
        "Status must be Published, Draft or Archived."
    ),
];

exports.updateAnnouncementValidator = [
    body("title")
    .optional()
    .trim()
    .notEmpty(),

    body("message")
    .optional()
    .trim()
    .notEmpty(),

    body("audience")
    .optional()
    .trim()
    .notEmpty(),

    body("publishDate")
    .optional()
    .isISO8601(),

    body("expiryDate")
    .optional()
    .isISO8601(),

    body("status")
    .optional()
    .isIn(["Published", "Draft", "Archived"]),
];