const { body } = require("express-validator");

exports.createSubjectValidator = [
    body("subjectName")
    .trim()
    .notEmpty()
    .withMessage("Subject name is required."),

    body("subjectCode")
    .trim()
    .notEmpty()
    .withMessage("Subject code is required."),

    body("description")
    .optional()
    .isString()
    .withMessage("Description must be text."),

    body("departmentId")
    .optional()
    .isInt()
    .withMessage("Department ID must be an integer."),

    body("teacherId")
    .optional()
    .isInt()
    .withMessage("Teacher ID must be an integer."),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive."),
];

exports.updateSubjectValidator = [
    body("subjectName")
    .optional()
    .trim()
    .notEmpty(),

    body("subjectCode")
    .optional()
    .trim()
    .notEmpty(),

    body("description")
    .optional()
    .isString(),

    body("departmentId")
    .optional()
    .isInt(),

    body("teacherId")
    .optional()
    .isInt(),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"]),
];