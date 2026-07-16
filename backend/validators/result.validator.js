const { body } = require("express-validator");

exports.createResultValidator = [
    body("studentId")
    .isInt()
    .withMessage("Student ID is required."),

    body("subjectId")
    .isInt()
    .withMessage("Subject ID is required."),

    body("examinationId")
    .isInt()
    .withMessage("Examination ID is required."),

    body("marksObtained")
    .isFloat({ min: 0 })
    .withMessage("Marks obtained must be a valid number."),

    body("grade")
    .trim()
    .notEmpty()
    .withMessage("Grade is required."),

    body("remarks")
    .optional()
    .isString()
    .withMessage("Remarks must be text."),
];

exports.updateResultValidator = [
    body("studentId")
    .optional()
    .isInt(),

    body("subjectId")
    .optional()
    .isInt(),

    body("examinationId")
    .optional()
    .isInt(),

    body("marksObtained")
    .optional()
    .isFloat({ min: 0 }),

    body("grade")
    .optional()
    .trim()
    .notEmpty(),

    body("remarks")
    .optional()
    .isString(),
];