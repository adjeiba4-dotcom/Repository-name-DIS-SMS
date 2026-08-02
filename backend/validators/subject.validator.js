const { body, param, query } = require("express-validator");

/**
 * Create Subject
 */
exports.createSubject = [
    body("code")
        .trim()
        .notEmpty()
        .withMessage("Subject code is required.")
        .isLength({ max: 30 })
        .withMessage("Subject code cannot exceed 30 characters."),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Subject name is required.")
        .isLength({ max: 150 })
        .withMessage("Subject name cannot exceed 150 characters."),

    body("departmentId")
        .isInt({ min: 1 })
        .withMessage("Department is required."),

    body("schoolClassId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("School class must be a positive integer."),

    body("creditHours")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Credit hours must be at least 1."),

    body("description")
        .optional()
        .trim()
];

/**
 * Update Subject
 */
exports.updateSubject = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Subject ID must be a positive integer."),

    body("code")
        .optional()
        .trim()
        .notEmpty(),

    body("name")
        .optional()
        .trim()
        .notEmpty(),

    body("departmentId")
        .optional()
        .isInt({ min: 1 }),

    body("schoolClassId")
        .optional({ nullable: true })
        .isInt({ min: 1 }),

    body("creditHours")
        .optional()
        .isInt({ min: 1 }),

    body("description")
        .optional()
        .trim()
];

/**
 * Validate Subject ID
 */
exports.validateSubjectId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Subject ID must be a positive integer.")
];

/**
 * Search Subject
 */
exports.searchSubject = [
    query("keyword")
        .optional()
        .trim()
];