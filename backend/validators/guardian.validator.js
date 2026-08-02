const { body, param, query } = require("express-validator");

/**
 * Create Guardian Validation
 */
exports.createGuardian = [
    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required.")
        .isLength({ max: 100 })
        .withMessage("First name cannot exceed 100 characters."),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required.")
        .isLength({ max: 100 })
        .withMessage("Last name cannot exceed 100 characters."),

    body("relationship")
        .trim()
        .notEmpty()
        .withMessage("Relationship is required."),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required.")
        .isLength({ min: 8, max: 20 })
        .withMessage("Phone number must be between 8 and 20 characters."),

    body("alternatePhone")
        .optional()
        .trim()
        .isLength({ min: 8, max: 20 })
        .withMessage("Alternate phone must be between 8 and 20 characters."),

    body("email")
        .optional({ nullable: true, checkFalsy: true })
        .isEmail()
        .withMessage("Please provide a valid email address."),

    body("occupation")
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Occupation cannot exceed 150 characters."),

    body("address")
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage("Address cannot exceed 255 characters."),
];

/**
 * Update Guardian Validation
 */
exports.updateGuardian = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Guardian ID must be a positive integer."),

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

    body("relationship")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Relationship cannot be empty."),

    body("phone")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Phone number cannot be empty."),

    body("alternatePhone")
        .optional()
        .trim(),

    body("email")
        .optional({ nullable: true, checkFalsy: true })
        .isEmail()
        .withMessage("Please provide a valid email address."),

    body("occupation")
        .optional()
        .trim(),

    body("address")
        .optional()
        .trim(),
];

/**
 * Validate Guardian ID
 */
exports.validateGuardianId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Guardian ID must be a positive integer."),
];

/**
 * Search Guardian Validation
 */
exports.searchGuardian = [
    query("keyword")
        .optional()
        .trim()
];