// validators/timetable.validator.js

const {
    body,
    param,
    query,
} = require("express-validator");

/**
 * Validate Timetable ID
 */
const validateTimetableId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage(
        "Timetable ID must be a positive integer."
    ),
];

/**
 * Create Timetable
 */
const createTimetable = [
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

    body("classId")
    .isInt({ min: 1 })
    .withMessage(
        "Class is required."
    ),

    body("subjectId")
    .isInt({ min: 1 })
    .withMessage(
        "Subject is required."
    ),

    body("teacherId")
    .isInt({ min: 1 })
    .withMessage(
        "Teacher is required."
    ),

    body("dayOfWeek")
    .trim()
    .notEmpty()
    .withMessage(
        "Day of week is required."
    ),

    body("startTime")
    .notEmpty()
    .withMessage(
        "Start time is required."
    ),

    body("endTime")
    .notEmpty()
    .withMessage(
        "End time is required."
    ),

    body("room")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage(
        "Room cannot exceed 100 characters."
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
 * Update Timetable
 */
const updateTimetable = [
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

    body("classId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Class must be a positive integer."
    ),

    body("subjectId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Subject must be a positive integer."
    ),

    body("teacherId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
        "Teacher must be a positive integer."
    ),

    body("dayOfWeek")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
        "Day of week cannot be empty."
    ),

    body("startTime")
    .optional()
    .notEmpty()
    .withMessage(
        "Start time cannot be empty."
    ),

    body("endTime")
    .optional()
    .notEmpty()
    .withMessage(
        "End time cannot be empty."
    ),

    body("room")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage(
        "Room cannot exceed 100 characters."
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
 * Search Timetable
 */
const searchTimetables = [
    query("keyword")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage(
        "Keyword cannot be empty."
    ),
];

module.exports = {
    validateTimetableId,
    createTimetable,
    updateTimetable,
    searchTimetables,
};