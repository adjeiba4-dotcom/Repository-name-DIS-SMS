const { body, param, query } = require("express-validator");

/**
 * Validate Report Card ID
 */
const validateReportCardId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage(
        "Report card ID must be a positive integer."
    ),
];

/**
 * Create Report Card
 */
const createReportCard = [
    body("studentId")
    .isInt({ min: 1 })
    .withMessage(
        "Student is required."
    ),

    body("academicYearId")
    .isInt({ min: 1 })
    .withMessage(
        "Academic year is required."
    ),

    body("termId")
    .isInt({ min: 1 })
    .withMessage(
        "Term is required."
    ),

    body("teacherRemarks")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Teacher remarks cannot exceed 500 characters."
    ),

    body("headmasterRemarks")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Headmaster remarks cannot exceed 500 characters."
    ),

    body("promoted")
    .optional()
    .isBoolean()
    .withMessage(
        "Promoted must be true or false."
    ),
];

/**
 * Update Report Card
 */
const updateReportCard = [
    body("studentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Student must be a positive integer."
    ),

    body("academicYearId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Academic year must be a positive integer."
    ),

    body("termId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Term must be a positive integer."
    ),

    body("teacherRemarks")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Teacher remarks cannot exceed 500 characters."
    ),

    body("headmasterRemarks")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Headmaster remarks cannot exceed 500 characters."
    ),

    body("promoted")
    .optional()
    .isBoolean()
    .withMessage(
        "Promoted must be true or false."
    ),
];

/**
 * Search Report Cards
 */
const searchReportCards = [
    query("keyword")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage(
        "Keyword cannot be empty."
    ),
];

module.exports = {
    validateReportCardId,
    createReportCard,
    updateReportCard,
    searchReportCards,
};