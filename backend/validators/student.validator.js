const { body } = require("express-validator");

const genderValues = ["MALE", "FEMALE"];

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

    body("otherName")
    .optional()
    .trim(),

    body("gender")
    .notEmpty()
    .withMessage("Gender is required.")
    .isIn(genderValues)
    .withMessage("Gender must be MALE or FEMALE."),

    body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date."),

    body("admissionDate")
    .notEmpty()
    .withMessage("Admission date is required.")
    .isISO8601()
    .withMessage("Admission date must be a valid date."),

    body("guardianId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Guardian ID must be a positive integer."),

    body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email address."),

    body("phone")
    .optional()
    .trim(),

    body("address")
    .optional()
    .trim(),
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

    body("otherName")
    .optional()
    .trim(),

    body("gender")
    .optional()
    .isIn(genderValues)
    .withMessage("Gender must be MALE or FEMALE."),

    body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date."),

    body("admissionDate")
    .optional()
    .isISO8601()
    .withMessage("Admission date must be a valid date."),

    body("guardianId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Guardian ID must be a positive integer."),

    body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email address."),

    body("phone")
    .optional()
    .trim(),

    body("address")
    .optional()
    .trim(),
];