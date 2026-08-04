// validators/student.validator.js

const { body, param, query } = require("express-validator");

/**
 * Create Student Validation
 */
exports.createStudent = [
    body("admissionNo")
        .trim()
        .notEmpty()
        .withMessage("Admission number is required.")
        .isLength({ min: 3, max: 30 })
        .withMessage("Admission number must be between 3 and 30 characters."),

    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required.")
        .isLength({ min: 2, max: 100 })
        .withMessage("First name must be between 2 and 100 characters."),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required.")
        .isLength({ min: 2, max: 100 })
        .withMessage("Last name must be between 2 and 100 characters."),

    body("otherName")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Other name cannot exceed 100 characters."),

    body("gender")
        .trim()
        .notEmpty()
        .withMessage("Gender is required.")
        .isIn(["MALE", "FEMALE"])
        .withMessage("Gender must be either MALE or FEMALE."),

    body("dateOfBirth")
        .notEmpty()
        .withMessage("Date of birth is required.")
        .isISO8601()
        .withMessage("Date of birth must be a valid date."),

    body("admissionDate")
        .notEmpty()
        .withMessage("Admission date is required.")
        .isISO8601()
        .withMessage("Admission date must be a valid date."),

    body("guardianId")
        .notEmpty()
        .withMessage("Guardian is required.")
        .isInt({ min: 1 })
        .withMessage("Guardian ID must be a valid integer."),

    body("relationship")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("Relationship is invalid."),

    body("classId")
        .notEmpty()
        .withMessage("Class is required.")
        .isInt({ min: 1 })
        .withMessage("Class ID must be a valid integer."),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email address.")
        .normalizeEmail(),

    body("phone")
        .optional()
        .trim()
        .isLength({ min: 7, max: 20 })
        .withMessage("Phone number is invalid."),

    body("address")
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage("Address cannot exceed 255 characters."),

    body("status")
        .optional()
        .isIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
        .withMessage(
            "Status must be ACTIVE, INACTIVE or ARCHIVED."
        ),
];

/**
 * Update Student Validation
 */
exports.updateStudent = [
    body("admissionNo")
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("Admission number must be between 3 and 30 characters."),

    body("firstName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("First name must be between 2 and 100 characters."),

    body("lastName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Last name must be between 2 and 100 characters."),

    body("otherName")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Other name cannot exceed 100 characters."),

    body("gender")
        .optional()
        .isIn(["MALE", "FEMALE"])
        .withMessage("Gender must be either MALE or FEMALE."),

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
        .withMessage("Guardian ID must be a valid integer."),

    body("relationship")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("Relationship is invalid."),

    body("classId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Class ID must be a valid integer."),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email address.")
        .normalizeEmail(),

    body("phone")
        .optional()
        .trim()
        .isLength({ min: 7, max: 20 })
        .withMessage("Phone number is invalid."),

    body("address")
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage("Address cannot exceed 255 characters."),

    body("status")
        .optional()
        .isIn(["ACTIVE", "INACTIVE", "ARCHIVED"])
        .withMessage(
            "Status must be ACTIVE, INACTIVE or ARCHIVED."
        ),
];

/**
 * Student ID Validation
 */
exports.validateStudentId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Student ID must be a valid integer."),
];

/**
 * Search Student Validation
 */
exports.searchStudent = [
    query("search")
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage(
            "Search text must be between 1 and 100 characters."
        ),
];