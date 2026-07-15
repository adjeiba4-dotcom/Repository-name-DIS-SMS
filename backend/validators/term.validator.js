const { body } = require("express-validator");

exports.createTermValidator = [
    body("termName")
    .notEmpty()
    .withMessage("Term name is required."),

    body("startDate")
    .notEmpty()
    .isISO8601()
    .withMessage("A valid start date is required."),

    body("endDate")
    .notEmpty()
    .isISO8601()
    .withMessage("A valid end date is required."),

    body("academicYearId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("A valid Academic Year is required."),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be either Active or Inactive."),
];