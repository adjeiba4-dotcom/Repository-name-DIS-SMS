// validators/teacher.validator.js

const { body, param, query } = require("express-validator");

exports.createTeacher = [
    body("staffNo")
    .trim()
    .notEmpty()
    .withMessage("Staff Number is required.")
    .isLength({ max: 50 })
    .withMessage("Staff Number cannot exceed 50 characters."),

    body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First Name is required.")
    .isLength({ max: 100 })
    .withMessage("First Name cannot exceed 100 characters."),

    body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last Name is required.")
    .isLength({ max: 100 })
    .withMessage("Last Name cannot exceed 100 characters."),

    body("gender")
    .notEmpty()
    .withMessage("Gender is required.")
    .isIn(["MALE", "FEMALE"])
    .withMessage("Gender must be MALE or FEMALE."),

    body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be valid."),

    body("phone")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Phone number cannot exceed 30 characters."),

    body("address")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Address cannot exceed 255 characters."),

    body("qualification")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Qualification cannot exceed 150 characters."),

    body("employmentDate")
    .optional()
    .isISO8601()
    .withMessage("Employment Date must be a valid date."),

    body("departmentId")
    .notEmpty()
    .withMessage("Department is required.")
    .isInt({ min: 1 })
    .withMessage("Department ID must be a valid integer."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.updateTeacher = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Teacher ID must be a valid integer."),

    body("staffNo")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Staff Number cannot exceed 50 characters."),

    body("firstName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("First Name cannot exceed 100 characters."),

    body("lastName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Last Name cannot exceed 100 characters."),

    body("gender")
    .optional()
    .isIn(["MALE", "FEMALE"])
    .withMessage("Gender must be MALE or FEMALE."),

    body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be valid."),

    body("phone")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Phone number cannot exceed 30 characters."),

    body("address")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Address cannot exceed 255 characters."),

    body("qualification")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Qualification cannot exceed 150 characters."),

    body("employmentDate")
    .optional()
    .isISO8601()
    .withMessage("Employment Date must be a valid date."),

    body("departmentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Department ID must be a valid integer."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.validateTeacherId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Teacher ID must be a valid integer."),
];

exports.searchTeacher = [
    query("keyword")
    .trim()
    .notEmpty()
    .withMessage("Search keyword is required.")
    .isLength({ max: 100 })
    .withMessage("Search keyword cannot exceed 100 characters."),
];