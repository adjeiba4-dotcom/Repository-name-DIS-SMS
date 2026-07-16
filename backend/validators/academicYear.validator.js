const { body } = require("express-validator");

exports.createAcademicYearValidator = [
    body("yearName")
    .trim()
    .notEmpty()
    .withMessage("Academic year is required."),

    body("startDate")
    .notEmpty()
    .isISO8601()
    .withMessage("Valid start date is required."),

    body("endDate")
    .notEmpty()
    .isISO8601()
    .withMessage("Valid end date is required."),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive."),
];

exports.updateAcademicYearValidator = [
    body("yearName")
    .optional()
    .trim()
    .notEmpty(),

    body("startDate")
    .optional()
    .isISO8601(),

    body("endDate")
    .optional()
    .isISO8601(),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"]),
];