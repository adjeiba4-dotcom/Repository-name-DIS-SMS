// validators/teacherSubject.validator.js

const { body, param, query } = require("express-validator");

exports.createTeacherSubject = [
    body("teacherId")
    .notEmpty()
    .withMessage("Teacher ID is required.")
    .isInt({ min: 1 })
    .withMessage("Teacher ID must be a valid integer."),

    body("subjectId")
    .notEmpty()
    .withMessage("Subject ID is required.")
    .isInt({ min: 1 })
    .withMessage("Subject ID must be a valid integer."),
];

exports.updateTeacherSubject = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Assignment ID must be a valid integer."),

    body("teacherId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Teacher ID must be a valid integer."),

    body("subjectId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Subject ID must be a valid integer."),
];

exports.validateTeacherSubjectId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Assignment ID must be a valid integer."),
];

exports.searchTeacherSubject = [
    query("keyword")
    .trim()
    .notEmpty()
    .withMessage("Search keyword is required.")
    .isLength({ max: 100 })
    .withMessage("Search keyword cannot exceed 100 characters."),
];