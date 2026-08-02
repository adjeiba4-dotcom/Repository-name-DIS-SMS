// validators/result.validator.js

const { body, param, query } = require("express-validator");

exports.createResult = [
    body("studentId")
    .notEmpty()
    .withMessage("Student is required.")
    .isInt({ min: 1 })
    .withMessage("Student ID must be a positive integer."),

    body("examinationId")
    .notEmpty()
    .withMessage("Examination is required.")
    .isInt({ min: 1 })
    .withMessage("Examination ID must be a positive integer."),

    body("subjectId")
    .notEmpty()
    .withMessage("Subject is required.")
    .isInt({ min: 1 })
    .withMessage("Subject ID must be a positive integer."),

    body("termId")
    .notEmpty()
    .withMessage("Term is required.")
    .isInt({ min: 1 })
    .withMessage("Term ID must be a positive integer."),

    body("marks")
    .notEmpty()
    .withMessage("Marks are required.")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Marks must be between 0 and 100."),

    body("grade")
    .optional()
    .trim()
    .isLength({ max: 5 })
    .withMessage("Grade cannot exceed 5 characters."),

    body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

exports.updateResult = [
    body("studentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Student ID must be a positive integer."),

    body("examinationId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Examination ID must be a positive integer."),

    body("subjectId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Subject ID must be a positive integer."),

    body("termId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Term ID must be a positive integer."),

    body("marks")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Marks must be between 0 and 100."),

    body("grade")
    .optional()
    .trim()
    .isLength({ max: 5 })
    .withMessage("Grade cannot exceed 5 characters."),

    body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

exports.validateResultId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Result ID must be a positive integer."),
];

exports.searchResults = [
    query("keyword")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage(
        "Search keyword must contain at least one character."
    ),
];