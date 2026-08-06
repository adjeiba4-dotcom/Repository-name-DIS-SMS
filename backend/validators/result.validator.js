// validators/result.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const SUMMARY_SCOPES = ["overview", "class", "subject", "student", "grade"];
const WORKFLOW_VALUES = ["DRAFT", "GENERATED", "VERIFIED", "PUBLISHED", "LOCKED"];

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

const optionalScoreBody = (field, label) =>
    body(field)
        .optional({ nullable: true })
        .isFloat({ min: 0, max: 100 })
        .withMessage(`${label} must be between 0 and 100.`)
        .toFloat();

exports.listResults = [
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
    optionalIntQuery("studentId"),
    optionalIntQuery("examinationId"),
    optionalIntQuery("gradeId"),
    query("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
    query("isPassed")
        .optional()
        .isIn(["true", "false", "1", "0", true, false])
        .withMessage("isPassed must be true or false."),
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
    query("sortBy").optional().trim(),
    query("sortOrder")
        .optional()
        .trim()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc."),
];

exports.scopeReport = [
    query("academicYearId")
        .exists({ checkFalsy: true })
        .withMessage("Academic year is required.")
        .isInt({ min: 1 })
        .withMessage("Academic year must be a positive integer.")
        .toInt(),
    query("termId")
        .exists({ checkFalsy: true })
        .withMessage("Term is required.")
        .isInt({ min: 1 })
        .withMessage("Term must be a positive integer.")
        .toInt(),
    query("classId")
        .exists({ checkFalsy: true })
        .withMessage("Class is required.")
        .isInt({ min: 1 })
        .withMessage("Class must be a positive integer.")
        .toInt(),
    optionalIntQuery("subjectId"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100.")
        .toInt(),
];

exports.studentProfile = [
    param("studentId")
        .isInt({ min: 1 })
        .withMessage("Student id must be a positive integer.")
        .toInt(),
    optionalIntQuery("academicYearId"),
    optionalIntQuery("termId"),
    optionalIntQuery("classId"),
];

exports.statsResults = [
    query("scope")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toLowerCase())
        .isIn(SUMMARY_SCOPES)
        .withMessage(`Scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`),
    optionalIntQuery("academicYearId"),
    optionalIntQuery("termId"),
    optionalIntQuery("classId"),
    optionalIntQuery("subjectId"),
    optionalIntQuery("studentId"),
];

exports.validateResultId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Result id must be a positive integer.")
        .toInt(),
];

exports.generateResults = [
    requiredIntBody("academicYearId", "Academic year"),
    requiredIntBody("termId", "Term"),
    requiredIntBody("classId", "Class"),
    requiredIntBody("subjectId", "Subject"),
    optionalIntBody("examinationId", "Examination"),
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
    optionalScoreBody("caWeight", "CA weight"),
    optionalScoreBody("examWeight", "Exam weight"),
];

exports.createResult = [
    requiredIntBody("academicYearId", "Academic year"),
    requiredIntBody("termId", "Term"),
    requiredIntBody("classId", "Class"),
    requiredIntBody("subjectId", "Subject"),
    requiredIntBody("studentId", "Student"),
    requiredIntBody("examinationId", "Examination"),
    optionalScoreBody("caScore", "CA score"),
    optionalScoreBody("examScore", "Exam score"),
    optionalScoreBody("caWeight", "CA weight"),
    optionalScoreBody("examWeight", "Exam weight"),
    optionalScoreBody("finalScore", "Final score"),
    optionalIntBody("gradeId", "Grade"),
    body("remarks").optional({ nullable: true }).trim().isLength({ max: 255 }),
    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
    body("isPassed").optional().isBoolean().toBoolean(),
];

exports.updateResult = [
    optionalIntBody("academicYearId", "Academic year"),
    optionalIntBody("termId", "Term"),
    optionalIntBody("classId", "Class"),
    optionalIntBody("subjectId", "Subject"),
    optionalIntBody("studentId", "Student"),
    optionalIntBody("examinationId", "Examination"),
    optionalScoreBody("caScore", "CA score"),
    optionalScoreBody("examScore", "Exam score"),
    optionalScoreBody("caWeight", "CA weight"),
    optionalScoreBody("examWeight", "Exam weight"),
    optionalScoreBody("finalScore", "Final score"),
    optionalIntBody("gradeId", "Grade"),
    body("remarks").optional({ nullable: true }).trim().isLength({ max: 255 }),
    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
    body("isPassed").optional().isBoolean().toBoolean(),
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
    optionalIntBody("subjectId", "Subject"),
];

exports.recalculatePositions = [
    requiredIntBody("academicYearId", "Academic year"),
    requiredIntBody("termId", "Term"),
    requiredIntBody("classId", "Class"),
    optionalIntBody("subjectId", "Subject"),
];
