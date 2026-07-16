const { body } = require("express-validator");

exports.createTermValidator = [
    body("termName")
    .trim()
    .notEmpty()
    .withMessage("Term name is required."),

    body("startDate")
    .notEmpty()
    .isISO8601()
    .withMessage("Valid start date is required."),

    body("endDate")
    .notEmpty()
    .isISO8601()
    .withMessage("Valid end date is required."),

    body("academicYearId")
    .isInt()
    .withMessage("Academic Year ID is required."),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive."),
];

exports.updateTermValidator = [
    body("termName")
    .optional()
    .trim()
    .notEmpty(),

    body("startDate")
    .optional()
    .isISO8601(),

    body("endDate")
    .optional()
    .isISO8601(),

    body("academicYearId")
    .optional()
    .isInt(),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"]),
];