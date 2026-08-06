// validators/studentPromotion.validator.js

const { body, param, query } = require("express-validator");

const DECISION_VALUES = [
    "PENDING",
    "PROMOTED",
    "PROMOTED_ON_PROBATION",
    "REPEAT",
    "GRADUATED",
    "WITHDRAWN",
    "TRANSFERRED",
];

const WORKFLOW_VALUES = ["DRAFT", "APPROVED", "EXECUTED", "CANCELLED"];
const SUMMARY_SCOPES = ["overview", "class"];

const listPromotions = [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim().isLength({ max: 120 }),
    query("keyword").optional().trim().isLength({ max: 120 }),
    query("academicYearId").optional().isInt({ min: 1 }),
    query("fromAcademicYearId").optional().isInt({ min: 1 }),
    query("toAcademicYearId").optional().isInt({ min: 1 }),
    query("termId").optional().isInt({ min: 1 }),
    query("classId").optional().isInt({ min: 1 }),
    query("fromClassId").optional().isInt({ min: 1 }),
    query("toClassId").optional().isInt({ min: 1 }),
    query("studentId").optional().isInt({ min: 1 }),
    query("decision")
        .optional()
        .trim()
        .toUpperCase()
        .isIn(DECISION_VALUES)
        .withMessage(
            `Decision must be one of: ${DECISION_VALUES.join(", ")}.`
        ),
    query("workflowStatus")
        .optional()
        .trim()
        .toUpperCase()
        .isIn(WORKFLOW_VALUES)
        .withMessage(
            `Workflow status must be one of: ${WORKFLOW_VALUES.join(", ")}.`
        ),
    query("graduatesOnly").optional().isBoolean().toBoolean(),
    query("sortBy").optional().trim().isLength({ max: 40 }),
    query("sortOrder").optional().trim().isIn(["asc", "desc"]),
];

const statsQuery = [
    query("scope")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(SUMMARY_SCOPES)
        .withMessage(`Scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`),
    query("academicYearId").optional().isInt({ min: 1 }),
    query("fromAcademicYearId").optional().isInt({ min: 1 }),
    query("termId").optional().isInt({ min: 1 }),
    query("classId").optional().isInt({ min: 1 }),
    query("fromClassId").optional().isInt({ min: 1 }),
];

const validatePromotionId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Promotion ID must be a positive integer."),
];

const validateStudentId = [
    param("studentId")
        .isInt({ min: 1 })
        .withMessage("Student ID must be a positive integer."),
];

const recommend = [
    body("academicYearId")
        .isInt({ min: 1 })
        .withMessage("Academic year is required."),
    body("termId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Term must be a positive integer."),
    body("classId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Class must be a positive integer."),
    body("studentId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Student must be a positive integer."),
    body("toAcademicYearId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Destination academic year must be a positive integer."),
    body("toClassId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Destination class must be a positive integer."),
    body("decision")
        .optional()
        .trim()
        .toUpperCase()
        .isIn(DECISION_VALUES)
        .withMessage(
            `Decision must be one of: ${DECISION_VALUES.join(", ")}.`
        ),
    body("regenerate").optional().isBoolean().toBoolean(),
    body("remarks")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 2000 }),
    body("classMappings").optional().isObject(),
];

const updatePromotion = [
    body("decision")
        .optional()
        .trim()
        .toUpperCase()
        .isIn(DECISION_VALUES.filter((d) => d !== "PENDING"))
        .withMessage(
            `Decision must be one of: ${DECISION_VALUES.filter((d) => d !== "PENDING").join(", ")}.`
        ),
    body("toClassId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Destination class must be a positive integer."),
    body("toAcademicYearId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("Destination academic year must be a positive integer."),
    body("promotionDate")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Promotion date must be a valid date."),
    body("remarks")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 2000 }),
    body("recommendationNotes")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 2000 }),
];

const bulkIds = [
    body("id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("id must be a positive integer."),
    body("ids")
        .optional()
        .isArray({ min: 1 })
        .withMessage("ids must be a non-empty array."),
    body("ids.*")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Each id must be a positive integer."),
];

const execute = [
    ...bulkIds,
    body("promotionDate")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Promotion date must be a valid date."),
    body("remarks")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 2000 }),
];

module.exports = {
    listPromotions,
    statsQuery,
    validatePromotionId,
    validateStudentId,
    recommend,
    updatePromotion,
    bulkIds,
    execute,
    DECISION_VALUES,
    WORKFLOW_VALUES,
};
