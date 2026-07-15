const { body } = require("express-validator");

exports.createStudentValidator = [
    body("admissionNo")
    .trim()
    .notEmpty()
    .withMessage("Admission number is required."),

    body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required."),

    body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required."),

    body("gender")
    .notEmpty()
    .withMessage("Gender is required."),

    body("guardianName")
    .trim()
    .notEmpty()
    .withMessage("Guardian name is required."),

    body("guardianPhone")
    .trim()
    .notEmpty()
    .withMessage("Guardian phone is required."),
];

exports.updateStudentValidator = [
    body("admissionNo")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Admission number cannot be empty."),

    body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty."),

    body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty."),

    body("gender")
    .optional()
    .notEmpty()
    .withMessage("Gender cannot be empty."),

    body("guardianName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Guardian name cannot be empty."),

    body("guardianPhone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Guardian phone cannot be empty."),
];