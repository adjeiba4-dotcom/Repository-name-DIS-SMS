// validators/assessment.validator.js

const { body, param, query } = require("express-validator");

const ASSESSMENT_TYPES = [
    "CLASS_WORK",
    "HOMEWORK",
    "QUIZ",
    "ASSIGNMENT",
    "PRACTICAL",
    "PROJECT",
    "ORAL_TEST",
    "MID_TERM",
    "CONTINUOUS_ASSESSMENT",
];

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const SUMMARY_SCOPES = [
    "overview",
    "class",
    "subject",
    "teacher",
    "type",
    "student",
];

const optionalIntQuery = (field) =>
    query(field)
        .optional()
        .isInt({ min: 1 })
        .withMessage(`${field} must be a positive integer.`)
        .toInt();

const optionalDateQuery = (field) =>
    query(field)
        .optional()
        .isISO8601()
        .withMessage(`${field} must be a valid date.`);

exports.listAssessments = [
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
    query("search").optional().trim().isLength({ max: 100 }),
    query("keyword").optional().trim().isLength({ max: 100 }),
    optionalIntQuery("academicYearId"),
    optionalIntQuery("termId"),
    optionalIntQuery("classId"),
    optionalIntQuery("subjectId"),
    optionalIntQuery("teacherId"),
    query("assessmentType")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(ASSESSMENT_TYPES)
        .withMessage(
            `Assessment type must be one of: ${ASSESSMENT_TYPES.join(", ")}.`
        ),
    query("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
    optionalDateQuery("assessmentDate"),
    optionalDateQuery("dateFrom"),
    optionalDateQuery("dateTo"),
    query("sortBy").optional().trim(),
    query("sortOrder")
        .optional()
        .trim()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc."),
];

exports.statsAssessments = [
    query("scope")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toLowerCase())
        .isIn(SUMMARY_SCOPES)
        .withMessage(
            `Scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`
        ),
    optionalIntQuery("academicYearId"),
    optionalIntQuery("termId"),
    optionalIntQuery("classId"),
    optionalIntQuery("subjectId"),
    optionalIntQuery("teacherId"),
    query("assessmentType")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(ASSESSMENT_TYPES)
        .withMessage(
            `Assessment type must be one of: ${ASSESSMENT_TYPES.join(", ")}.`
        ),
    optionalDateQuery("dateFrom"),
    optionalDateQuery("dateTo"),
];

exports.validateAssessmentId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Assessment ID must be a positive integer.")
        .toInt(),
];

exports.createAssessment = [
    body("title")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Title cannot exceed 150 characters."),

    body("academicYearId")
        .notEmpty()
        .withMessage("Academic year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic year must be a positive integer.")
        .toInt(),

    body("termId")
        .notEmpty()
        .withMessage("Term is required.")
        .isInt({ min: 1 })
        .withMessage("Term must be a positive integer.")
        .toInt(),

    body("classId")
        .notEmpty()
        .withMessage("Class is required.")
        .isInt({ min: 1 })
        .withMessage("Class must be a positive integer.")
        .toInt(),

    body("subjectId")
        .notEmpty()
        .withMessage("Subject is required.")
        .isInt({ min: 1 })
        .withMessage("Subject must be a positive integer.")
        .toInt(),

    body("teacherId")
        .notEmpty()
        .withMessage("Teacher is required.")
        .isInt({ min: 1 })
        .withMessage("Teacher must be a positive integer.")
        .toInt(),

    body("assessmentType")
        .notEmpty()
        .withMessage("Assessment type is required.")
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(ASSESSMENT_TYPES)
        .withMessage(
            `Assessment type must be one of: ${ASSESSMENT_TYPES.join(", ")}.`
        ),

    body("maxMarks")
        .notEmpty()
        .withMessage("Maximum marks are required.")
        .isFloat({ gt: 0, max: 9999.99 })
        .withMessage("Maximum marks must be greater than 0.")
        .toFloat(),

    body("assessmentDate")
        .notEmpty()
        .withMessage("Assessment date is required.")
        .isISO8601()
        .withMessage("Assessment date must be a valid date."),

    body("remarks")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Remarks cannot exceed 500 characters."),

    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.updateAssessment = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Assessment ID must be a positive integer.")
        .toInt(),

    body("title")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Title cannot exceed 150 characters."),

    body("academicYearId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Academic year must be a positive integer.")
        .toInt(),

    body("termId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Term must be a positive integer.")
        .toInt(),

    body("classId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Class must be a positive integer.")
        .toInt(),

    body("subjectId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Subject must be a positive integer.")
        .toInt(),

    body("teacherId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Teacher must be a positive integer.")
        .toInt(),

    body("assessmentType")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(ASSESSMENT_TYPES)
        .withMessage(
            `Assessment type must be one of: ${ASSESSMENT_TYPES.join(", ")}.`
        ),

    body("maxMarks")
        .optional()
        .isFloat({ gt: 0, max: 9999.99 })
        .withMessage("Maximum marks must be greater than 0.")
        .toFloat(),

    body("assessmentDate")
        .optional()
        .isISO8601()
        .withMessage("Assessment date must be a valid date."),

    body("remarks")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Remarks cannot exceed 500 characters."),

    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.bulkScores = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Assessment ID must be a positive integer.")
        .toInt(),

    body("action")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(["UPSERT", "CLEAR"])
        .withMessage("Score action must be UPSERT or CLEAR."),

    body("entries")
        .optional()
        .isArray()
        .withMessage("Entries must be an array."),

    body("entries.*.studentId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Each entry studentId must be a positive integer.")
        .toInt(),

    body("entries.*.marks")
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === "") return true;
            const num = Number(value);
            return !Number.isNaN(num) && num >= 0 && num <= 9999.99;
        })
        .withMessage("Marks must be a non-negative number."),

    body("entries.*.remarks")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Remarks cannot exceed 500 characters."),
];
