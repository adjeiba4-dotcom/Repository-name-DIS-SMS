// validators/examination.validator.js

const { body, param, query } = require("express-validator");

exports.createExamination = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Examination name is required.")
    .isLength({ min: 2, max: 100 })
    .withMessage("Examination name must be between 2 and 100 characters."),

    body("subjectId")
    .notEmpty()
    .withMessage("Subject is required.")
    .isInt({ min: 1 })
    .withMessage("Subject ID must be a positive integer."),

    body("teacherId")
    .notEmpty()
    .withMessage("Teacher is required.")
    .isInt({ min: 1 })
    .withMessage("Teacher ID must be a positive integer."),

    body("academicYearId")
    .notEmpty()
    .withMessage("Academic year is required.")
    .isInt({ min: 1 })
    .withMessage("Academic Year ID must be a positive integer."),

    body("termId")
    .notEmpty()
    .withMessage("Term is required.")
    .isInt({ min: 1 })
    .withMessage("Term ID must be a positive integer."),

    body("totalMarks")
    .notEmpty()
    .withMessage("Total marks is required.")
    .isInt({ min: 1 })
    .withMessage("Total marks must be greater than zero."),

    body("examDate")
    .notEmpty()
    .withMessage("Examination date is required.")
    .isISO8601()
    .withMessage("Examination date must be a valid date."),
];

exports.updateExamination = [
    body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Examination name must be between 2 and 100 characters."),

    body("subjectId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Subject ID must be a positive integer."),

    body("teacherId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Teacher ID must be a positive integer."),

    body("academicYearId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Academic Year ID must be a positive integer."),

    body("termId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Term ID must be a positive integer."),

    body("totalMarks")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Total marks must be greater than zero."),

    body("examDate")
    .optional()
    .isISO8601()
    .withMessage("Examination date must be a valid date."),
];

exports.validateExaminationId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Examination ID must be a positive integer."),
];

exports.searchExaminations = [
    query("keyword")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search keyword must contain at least one character."),
];