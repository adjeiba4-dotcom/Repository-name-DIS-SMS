// validators/studentPromotion.validator.js

const {
    body,
    param,
    query,
} = require("express-validator");

/**
 * Validate Promotion ID
 */
const validateStudentPromotionId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage(
        "Promotion ID must be a positive integer."
    ),
];

/**
 * Create Student Promotion
 */
const createStudentPromotion = [
    body("studentId")
    .isInt({ min: 1 })
    .withMessage(
        "Student is required."
    ),

    body("fromClassId")
    .isInt({ min: 1 })
    .withMessage(
        "Current class is required."
    ),

    body("toClassId")
    .isInt({ min: 1 })
    .withMessage(
        "Destination class is required."
    ),

    body("academicYearId")
    .isInt({ min: 1 })
    .withMessage(
        "Academic year is required."
    ),

    body("promotedBy")
    .isInt({ min: 1 })
    .withMessage(
        "Promoted by user is required."
    ),

    body("promotionDate")
    .optional()
    .isISO8601()
    .withMessage(
        "Promotion date must be a valid date."
    ),

    body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Remarks cannot exceed 500 characters."
    ),
];

/**
 * Update Student Promotion
 */
const updateStudentPromotion = [
    body("studentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Student must be a positive integer."
    ),

    body("fromClassId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Current class must be a positive integer."
    ),

    body("toClassId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Destination class must be a positive integer."
    ),

    body("academicYearId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Academic year must be a positive integer."
    ),

    body("promotedBy")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Promoted by user must be a positive integer."
    ),

    body("promotionDate")
    .optional()
    .isISO8601()
    .withMessage(
        "Promotion date must be a valid date."
    ),

    body("remarks")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage(
        "Remarks cannot exceed 500 characters."
    ),
];

/**
 * Search Student Promotions
 */
const searchStudentPromotions = [
    query("keyword")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage(
        "Keyword cannot be empty."
    ),
];

module.exports = {
    validateStudentPromotionId,
    createStudentPromotion,
    updateStudentPromotion,
    searchStudentPromotions,
};