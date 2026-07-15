const { body } = require("express-validator");

exports.createTeacherValidator = [
    body("staffNo")
    .trim()
    .notEmpty()
    .withMessage("Staff number is required."),

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

    body("email")
    .optional()
    .isEmail()
    .withMessage("A valid email is required."),

    body("departmentId")
    .optional()
    .isInt()
    .withMessage("Department ID must be an integer."),
];

exports.updateTeacherValidator = [
    body("staffNo")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Staff number cannot be empty."),

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

    body("email")
    .optional()
    .isEmail()
    .withMessage("A valid email is required."),

    body("departmentId")
    .optional()
    .isInt()
    .withMessage("Department ID must be an integer."),
];