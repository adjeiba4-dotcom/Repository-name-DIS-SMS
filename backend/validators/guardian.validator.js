// validators/guardian.validator.js

const { body, param, query } = require("express-validator");

const GUARDIAN_RELATIONSHIPS = [
    "FATHER",
    "MOTHER",
    "GUARDIAN",
    "SPONSOR",
    "UNCLE",
    "AUNT",
    "BROTHER",
    "SISTER",
    "GRANDPARENT",
    "OTHER",
];

exports.createGuardian = [
    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required.")
        .isLength({ max: 100 })
        .withMessage("First name cannot exceed 100 characters."),

    body("middleName")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Middle name cannot exceed 100 characters."),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required.")
        .isLength({ max: 100 })
        .withMessage("Last name cannot exceed 100 characters."),

    body("gender")
        .notEmpty()
        .withMessage("Gender is required.")
        .isIn(["MALE", "FEMALE"])
        .withMessage("Gender must be MALE or FEMALE."),

    body("dateOfBirth")
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage("Date of birth must be a valid date."),

    body("nationalId")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 50 })
        .withMessage("National ID cannot exceed 50 characters."),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required.")
        .isLength({ min: 8, max: 30 })
        .withMessage("Phone number must be between 8 and 30 characters."),

    body("alternatePhone")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 8, max: 30 })
        .withMessage(
            "Alternate phone must be between 8 and 30 characters."
        ),

    body("email")
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage("Please provide a valid email address.")
        .normalizeEmail(),

    body("occupation")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 150 })
        .withMessage("Occupation cannot exceed 150 characters."),

    body("employer")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 150 })
        .withMessage("Employer cannot exceed 150 characters."),

    body("residentialAddress")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 })
        .withMessage(
            "Residential address cannot exceed 255 characters."
        ),

    body("digitalAddress")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Digital address cannot exceed 100 characters."),

    body("photo")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 })
        .withMessage("Photo path cannot exceed 255 characters."),

    body("notes")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Notes cannot exceed 1000 characters."),

    body("status")
        .optional()
        .isIn(["ACTIVE", "INACTIVE"])
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.updateGuardian = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Guardian ID must be a valid integer."),

    body("firstName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("First name cannot be empty.")
        .isLength({ max: 100 })
        .withMessage("First name cannot exceed 100 characters."),

    body("middleName")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Middle name cannot exceed 100 characters."),

    body("lastName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Last name cannot be empty.")
        .isLength({ max: 100 })
        .withMessage("Last name cannot exceed 100 characters."),

    body("gender")
        .optional()
        .isIn(["MALE", "FEMALE"])
        .withMessage("Gender must be MALE or FEMALE."),

    body("dateOfBirth")
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601()
        .withMessage("Date of birth must be a valid date."),

    body("nationalId")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 50 })
        .withMessage("National ID cannot exceed 50 characters."),

    body("phone")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Phone number cannot be empty.")
        .isLength({ min: 8, max: 30 })
        .withMessage("Phone number must be between 8 and 30 characters."),

    body("alternatePhone")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ min: 8, max: 30 })
        .withMessage(
            "Alternate phone must be between 8 and 30 characters."
        ),

    body("email")
        .optional({ nullable: true, checkFalsy: true })
        .isEmail()
        .withMessage("Please provide a valid email address.")
        .normalizeEmail(),

    body("occupation")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 150 })
        .withMessage("Occupation cannot exceed 150 characters."),

    body("employer")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 150 })
        .withMessage("Employer cannot exceed 150 characters."),

    body("residentialAddress")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 255 })
        .withMessage(
            "Residential address cannot exceed 255 characters."
        ),

    body("digitalAddress")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Digital address cannot exceed 100 characters."),

    body("photo")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 255 })
        .withMessage("Photo path cannot exceed 255 characters."),

    body("notes")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Notes cannot exceed 1000 characters."),

    body("status")
        .optional()
        .isIn(["ACTIVE", "INACTIVE"])
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.validateGuardianId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Guardian ID must be a valid integer."),
];

exports.listGuardians = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer.")
        .toInt(),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100.")
        .toInt(),

    query("search")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Search keyword cannot exceed 100 characters."),

    query("keyword")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Search keyword cannot exceed 100 characters."),
];

exports.linkGuardianToStudent = [
    param("studentId")
        .isInt({ min: 1 })
        .withMessage("Student ID must be a valid integer.")
        .toInt(),

    body("guardianId")
        .notEmpty()
        .withMessage("Guardian ID is required.")
        .isInt({ min: 1 })
        .withMessage("Guardian ID must be a valid integer.")
        .toInt(),

    body("relationship")
        .notEmpty()
        .withMessage("Relationship is required.")
        .isIn(GUARDIAN_RELATIONSHIPS)
        .withMessage(
            `Relationship must be one of: ${GUARDIAN_RELATIONSHIPS.join(", ")}.`
        ),

    body("isPrimary")
        .optional()
        .isBoolean()
        .withMessage("isPrimary must be a boolean.")
        .toBoolean(),

    body("emergencyContact")
        .optional()
        .isBoolean()
        .withMessage("emergencyContact must be a boolean.")
        .toBoolean(),

    body("financialResponsibility")
        .optional()
        .isBoolean()
        .withMessage("financialResponsibility must be a boolean.")
        .toBoolean(),

    body("canPickup")
        .optional()
        .isBoolean()
        .withMessage("canPickup must be a boolean.")
        .toBoolean(),

    body("remarks")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 })
        .withMessage("Remarks cannot exceed 255 characters."),
];

exports.unlinkGuardianFromStudent = [
    param("studentId")
        .isInt({ min: 1 })
        .withMessage("Student ID must be a valid integer.")
        .toInt(),

    param("guardianId")
        .isInt({ min: 1 })
        .withMessage("Guardian ID must be a valid integer.")
        .toInt(),
];

exports.validateStudentId = [
    param("studentId")
        .isInt({ min: 1 })
        .withMessage("Student ID must be a valid integer.")
        .toInt(),
];
