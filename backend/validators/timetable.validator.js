// validators/timetable.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const DAY_VALUES = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const VIEW_VALUES = ["grid", "class", "teacher", "subject"];

const optionalIntQuery = (field) =>
    query(field)
        .optional()
        .isInt({ min: 1 })
        .withMessage(`${field} must be a positive integer.`)
        .toInt();

exports.listTimetables = [
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
    optionalIntQuery("teacherId"),
    optionalIntQuery("subjectId"),
    query("dayOfWeek")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(DAY_VALUES)
        .withMessage(`Day of week must be one of: ${DAY_VALUES.join(", ")}.`),
    query("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
    query("sortBy").optional().trim(),
    query("sortOrder")
        .optional()
        .trim()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc."),
];

exports.viewTimetables = [
    query("view")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toLowerCase())
        .isIn(VIEW_VALUES)
        .withMessage(`View must be one of: ${VIEW_VALUES.join(", ")}.`),
    query("academicYearId")
        .notEmpty()
        .withMessage("Academic year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic year must be a positive integer.")
        .toInt(),
    query("termId")
        .notEmpty()
        .withMessage("Term is required.")
        .isInt({ min: 1 })
        .withMessage("Term must be a positive integer.")
        .toInt(),
    optionalIntQuery("classId"),
    optionalIntQuery("teacherId"),
    optionalIntQuery("subjectId"),
    query("dayOfWeek")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(DAY_VALUES)
        .withMessage(`Day of week must be one of: ${DAY_VALUES.join(", ")}.`),
    query("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.validateTimetableId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Timetable ID must be a positive integer.")
        .toInt(),
];

exports.createTimetable = [
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

    body("dayOfWeek")
        .trim()
        .notEmpty()
        .withMessage("Day of week is required.")
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(DAY_VALUES)
        .withMessage(`Day of week must be one of: ${DAY_VALUES.join(", ")}.`),

    body("startTime")
        .trim()
        .notEmpty()
        .withMessage("Start time is required.")
        .matches(TIME_PATTERN)
        .withMessage("Start time must be in HH:mm 24-hour format."),

    body("endTime")
        .trim()
        .notEmpty()
        .withMessage("End time is required.")
        .matches(TIME_PATTERN)
        .withMessage("End time must be in HH:mm 24-hour format."),

    body("room")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Room cannot exceed 100 characters."),

    body("remarks")
        .optional({ nullable: true })
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

exports.updateTimetable = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Timetable ID must be a positive integer.")
        .toInt(),

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

    body("dayOfWeek")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Day of week cannot be empty.")
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(DAY_VALUES)
        .withMessage(`Day of week must be one of: ${DAY_VALUES.join(", ")}.`),

    body("startTime")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Start time cannot be empty.")
        .matches(TIME_PATTERN)
        .withMessage("Start time must be in HH:mm 24-hour format."),

    body("endTime")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("End time cannot be empty.")
        .matches(TIME_PATTERN)
        .withMessage("End time must be in HH:mm 24-hour format."),

    body("room")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Room cannot exceed 100 characters."),

    body("remarks")
        .optional({ nullable: true })
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
