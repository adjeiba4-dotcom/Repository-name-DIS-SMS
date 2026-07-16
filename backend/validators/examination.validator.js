const { body } = require("express-validator");

exports.createExaminationValidator = [
    body("examName")
    .trim()
    .notEmpty()
    .withMessage("Examination name is required."),

    body("examType")
    .trim()
    .notEmpty()
    .withMessage("Examination type is required."),

    body("examDate")
    .isISO8601()
    .withMessage("A valid examination date is required."),

    body("totalMarks")
    .isInt({ min: 1 })
    .withMessage("Total marks must be greater than zero."),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive."),
];

exports.updateExaminationValidator = [
    body("examName")
    .optional()
    .trim()
    .notEmpty(),

    body("examType")
    .optional()
    .trim()
    .notEmpty(),

    body("examDate")
    .optional()
    .isISO8601(),

    body("totalMarks")
    .optional()
    .isInt({ min: 1 }),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"]),
];