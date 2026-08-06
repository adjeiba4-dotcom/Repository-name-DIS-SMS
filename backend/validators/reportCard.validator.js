// validators/reportCard.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const SUMMARY_SCOPES = ["overview", "class"];
const WORKFLOW_VALUES = ["DRAFT", "GENERATED", "VERIFIED", "PUBLISHED", "LOCKED"];
const PROMOTION_VALUES = [
    "PENDING",
    "PROMOTED",
    "PROMOTED_ON_PROBATION",
    "REPEAT",
    "GRADUATED",
    "WITHDRAWN",
    "TRANSFERRED",
];

const optionalIntQuery = (field) =>
    query(field)
        .optional()
        .isInt({ min: 1 })
        .withMessage(`${field} must be a positive integer.`)
        .toInt();

const requiredIntBody = (field, label) =>
    body(field)
        .exists({ checkFalsy: true })
        .withMessage(`${label} is required.`)
        .isInt({ min: 1 })
        .withMessage(`${label} must be a positive integer.`)
        .toInt();

const optionalIntBody = (field, label = field) =>
    body(field)
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage(`${label} must be a positive integer.`)
        .toInt();

exports.listReportCards = [
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
    optionalIntQuery("studentId"),
    query("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
    query("isVerified")
        .optional()
        .isIn(["true", "false", "1", "0", true, false])
        .withMessage("isVerified must be true or false."),
    query("isPublished")
        .optional()
        .isIn(["true", "false", "1", "0", true, false])
        .withMessage("isPublished must be true or false."),
    query("isLocked")
        .optional()
        .isIn(["true", "false", "1", "0", true, false])
        .withMessage("isLocked must be true or false."),
    query("workflowStatus")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(WORKFLOW_VALUES)
        .withMessage(`Workflow status must be one of: ${WORKFLOW_VALUES.join(", ")}.`),
    query("promotionDecision")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(PROMOTION_VALUES)
        .withMessage(
            `Promotion decision must be one of: ${PROMOTION_VALUES.join(", ")}.`
        ),
    query("templateKey").optional().trim().isLength({ max: 50 }),
    query("sortBy").optional().trim(),
    query("sortOrder")
        .optional()
        .trim()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc."),
];

exports.statsQuery = [
    query("scope")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toLowerCase())
        .isIn(SUMMARY_SCOPES)
        .withMessage(`Scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`),
    optionalIntQuery("academicYearId"),
    optionalIntQuery("termId"),
    optionalIntQuery("classId"),
];

exports.validateId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Report card ID must be a positive integer.")
        .toInt(),
];

exports.generateReportCard = [
    requiredIntBody("studentId", "Student"),
    requiredIntBody("academicYearId", "Academic year"),
    requiredIntBody("termId", "Term"),
    optionalIntBody("classId", "Class"),
    body("templateKey").optional().trim().isLength({ max: 50 }),
    body("teacherRemarks").optional({ nullable: true }).trim().isLength({ max: 2000 }),
    body("headmasterRemarks").optional({ nullable: true }).trim().isLength({ max: 2000 }),
    body("promotionDecision")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(PROMOTION_VALUES)
        .withMessage(
            `Promotion decision must be one of: ${PROMOTION_VALUES.join(", ")}.`
        ),
    body("promoted")
        .optional()
        .isBoolean()
        .withMessage("promoted must be a boolean.")
        .toBoolean(),
    body("regenerate")
        .optional()
        .isBoolean()
        .withMessage("regenerate must be a boolean.")
        .toBoolean(),
    body("asDraft")
        .optional()
        .isBoolean()
        .withMessage("asDraft must be a boolean.")
        .toBoolean(),
];

exports.generateBulk = [
    requiredIntBody("academicYearId", "Academic year"),
    requiredIntBody("termId", "Term"),
    requiredIntBody("classId", "Class"),
    body("templateKey").optional().trim().isLength({ max: 50 }),
    body("teacherRemarks").optional({ nullable: true }).trim().isLength({ max: 2000 }),
    body("headmasterRemarks").optional({ nullable: true }).trim().isLength({ max: 2000 }),
    body("promotionDecision")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(PROMOTION_VALUES),
    body("promoted").optional().isBoolean().toBoolean(),
    body("regenerate").optional().isBoolean().toBoolean(),
    body("asDraft").optional().isBoolean().toBoolean(),
];

exports.updateReportCard = [
    body("teacherRemarks").optional({ nullable: true }).trim().isLength({ max: 2000 }),
    body("headmasterRemarks").optional({ nullable: true }).trim().isLength({ max: 2000 }),
    body("promotionDecision")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(PROMOTION_VALUES)
        .withMessage(
            `Promotion decision must be one of: ${PROMOTION_VALUES.join(", ")}.`
        ),
    body("promoted").optional().isBoolean().toBoolean(),
    body("templateKey").optional().trim().isLength({ max: 50 }),
    body("refreshSnapshot").optional().isBoolean().toBoolean(),
    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.scopeAction = [
    body("ids")
        .optional()
        .isArray({ min: 1 })
        .withMessage("ids must be a non-empty array."),
    body("ids.*")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Each id must be a positive integer.")
        .toInt(),
    optionalIntBody("academicYearId", "Academic year"),
    optionalIntBody("termId", "Term"),
    optionalIntBody("classId", "Class"),
];
