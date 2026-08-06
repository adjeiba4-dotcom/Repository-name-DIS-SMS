// validators/examination.validator.js

const { body, param, query } = require("express-validator");

const EXAMINATION_TYPES = [
    "MID_TERM",
    "END_OF_TERM",
    "MOCK",
    "FINAL",
    "ENTRANCE",
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

exports.listExaminations = [
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
    query("examinationType")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(EXAMINATION_TYPES)
        .withMessage(
            `Examination type must be one of: ${EXAMINATION_TYPES.join(", ")}.`
        ),
    query("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
    query("isLocked")
        .optional()
        .isIn(["true", "false", "1", "0", true, false])
        .withMessage("isLocked must be true or false."),
    optionalDateQuery("examinationDate"),
    optionalDateQuery("dateFrom"),
    optionalDateQuery("dateTo"),
    query("sortBy").optional().trim(),
    query("sortOrder")
        .optional()
        .trim()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc."),
];

exports.statsExaminations = [
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
    query("examinationType")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(EXAMINATION_TYPES)
        .withMessage(
            `Examination type must be one of: ${EXAMINATION_TYPES.join(", ")}.`
        ),
    optionalDateQuery("dateFrom"),
    optionalDateQuery("dateTo"),
];

exports.validateExaminationId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Examination ID must be a positive integer.")
        .toInt(),
];

exports.createExamination = [
    body("name")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Name cannot exceed 150 characters."),

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

    body("examinationType")
        .notEmpty()
        .withMessage("Examination type is required.")
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(EXAMINATION_TYPES)
        .withMessage(
            `Examination type must be one of: ${EXAMINATION_TYPES.join(", ")}.`
        ),

    body("maxMarks")
        .notEmpty()
        .withMessage("Maximum marks are required.")
        .isFloat({ gt: 0, max: 9999.99 })
        .withMessage("Maximum marks must be greater than 0.")
        .toFloat(),

    body("passingMarks")
        .notEmpty()
        .withMessage("Passing marks are required.")
        .isFloat({ min: 0, max: 9999.99 })
        .withMessage("Passing marks must be zero or greater.")
        .toFloat(),

    body("passMarks")
        .optional()
        .isFloat({ min: 0, max: 9999.99 })
        .withMessage("Passing marks must be zero or greater.")
        .toFloat(),

    body("examinationDate")
        .notEmpty()
        .withMessage("Examination date is required.")
        .isISO8601()
        .withMessage("Examination date must be a valid date."),

    body("durationMinutes")
        .optional({ nullable: true })
        .isInt({ min: 1, max: 1440 })
        .withMessage("Duration must be between 1 and 1440 minutes.")
        .toInt(),

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

exports.updateExamination = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Examination ID must be a positive integer.")
        .toInt(),

    body("name")
        .optional({ nullable: true })
        .isString()
        .trim()
        .isLength({ max: 150 })
        .withMessage("Name cannot exceed 150 characters."),

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

    body("examinationType")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(EXAMINATION_TYPES)
        .withMessage(
            `Examination type must be one of: ${EXAMINATION_TYPES.join(", ")}.`
        ),

    body("maxMarks")
        .optional()
        .isFloat({ gt: 0, max: 9999.99 })
        .withMessage("Maximum marks must be greater than 0.")
        .toFloat(),

    body("passingMarks")
        .optional()
        .isFloat({ min: 0, max: 9999.99 })
        .withMessage("Passing marks must be zero or greater.")
        .toFloat(),

    body("passMarks")
        .optional()
        .isFloat({ min: 0, max: 9999.99 })
        .withMessage("Passing marks must be zero or greater.")
        .toFloat(),

    body("examinationDate")
        .optional()
        .isISO8601()
        .withMessage("Examination date must be a valid date."),

    body("durationMinutes")
        .optional({ nullable: true })
        .isInt({ min: 1, max: 1440 })
        .withMessage("Duration must be between 1 and 1440 minutes.")
        .toInt(),

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
        .withMessage("Examination ID must be a positive integer.")
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
