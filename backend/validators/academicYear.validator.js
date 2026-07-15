const { body } = require("express-validator");

exports.createAcademicYearValidator = [
    body("yearName")
    .notEmpty()
    .withMessage("Academic year name is required."),

    body("startDate")
    .notEmpty()
    .isISO8601()
    .withMessage("A valid start date is required."),

    body("endDate")
    .notEmpty()
    .isISO8601()
    .withMessage("A valid end date is required."),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be either Active or Inactive."),
];