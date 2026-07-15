const { body } = require("express-validator");

exports.createAnnouncementValidator = [
    body("title")
    .notEmpty()
    .withMessage("Announcement title is required."),

    body("content")
    .notEmpty()
    .withMessage("Announcement content is required."),

    body("audience")
    .isIn(["All", "Students", "Teachers", "Parents", "Staff"])
    .withMessage("Audience must be All, Students, Teachers, Parents or Staff."),

    body("publishDate")
    .isISO8601()
    .withMessage("Valid publish date is required."),

    body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Expiry date must be valid."),
];