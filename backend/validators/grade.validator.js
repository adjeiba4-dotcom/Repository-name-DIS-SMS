// validators/grade.validator.js

const { body, param, query } = require("express-validator");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];

exports.listScales = [
    query("search").optional().trim().isLength({ max: 100 }),
    query("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.validateScaleId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Grade scale id must be a positive integer.")
        .toInt(),
];

exports.createScale = [
    body("name")
        .exists({ checkFalsy: true })
        .withMessage("Grade scale name is required.")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters."),
    body("description").optional({ nullable: true }).trim().isLength({ max: 255 }),
    body("isDefault").optional().isBoolean().toBoolean(),
    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.updateScale = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be between 2 and 100 characters."),
    body("description").optional({ nullable: true }).trim().isLength({ max: 255 }),
    body("isDefault").optional().isBoolean().toBoolean(),
    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.listGrades = [
    query("gradeScaleId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("gradeScaleId must be a positive integer.")
        .toInt(),
    query("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.validateGradeId = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("Grade id must be a positive integer.")
        .toInt(),
];

exports.createGrade = [
    body("grade")
        .exists({ checkFalsy: true })
        .withMessage("Grade letter is required.")
        .trim()
        .isLength({ min: 1, max: 10 })
        .withMessage("Grade letter must be between 1 and 10 characters."),
    body("gradeScaleId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("gradeScaleId must be a positive integer.")
        .toInt(),
    body("description").optional({ nullable: true }).trim().isLength({ max: 255 }),
    body("minimumScore")
        .exists({ checkFalsy: false })
        .withMessage("Minimum score is required.")
        .isFloat({ min: 0, max: 100 })
        .withMessage("Minimum score must be between 0 and 100.")
        .toFloat(),
    body("maximumScore")
        .exists({ checkFalsy: false })
        .withMessage("Maximum score is required.")
        .isFloat({ min: 0, max: 100 })
        .withMessage("Maximum score must be between 0 and 100.")
        .toFloat(),
    body("gradePoint")
        .optional({ nullable: true })
        .isFloat({ min: 0, max: 10 })
        .withMessage("Grade point must be between 0 and 10.")
        .toFloat(),
    body("remarks").optional({ nullable: true }).trim().isLength({ max: 255 }),
    body("isPass").optional().isBoolean().toBoolean(),
    body("sortOrder")
        .optional()
        .isInt({ min: 0 })
        .withMessage("sortOrder must be a non-negative integer.")
        .toInt(),
    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];

exports.updateGrade = [
    body("grade")
        .optional()
        .trim()
        .isLength({ min: 1, max: 10 })
        .withMessage("Grade letter must be between 1 and 10 characters."),
    body("gradeScaleId")
        .optional({ nullable: true })
        .isInt({ min: 1 })
        .withMessage("gradeScaleId must be a positive integer.")
        .toInt(),
    body("description").optional({ nullable: true }).trim().isLength({ max: 255 }),
    body("minimumScore")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Minimum score must be between 0 and 100.")
        .toFloat(),
    body("maximumScore")
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Maximum score must be between 0 and 100.")
        .toFloat(),
    body("gradePoint")
        .optional({ nullable: true })
        .isFloat({ min: 0, max: 10 })
        .withMessage("Grade point must be between 0 and 10.")
        .toFloat(),
    body("remarks").optional({ nullable: true }).trim().isLength({ max: 255 }),
    body("isPass").optional().isBoolean().toBoolean(),
    body("sortOrder")
        .optional()
        .isInt({ min: 0 })
        .withMessage("sortOrder must be a non-negative integer.")
        .toInt(),
    body("status")
        .optional()
        .trim()
        .customSanitizer((value) => String(value).toUpperCase())
        .isIn(STATUS_VALUES)
        .withMessage("Status must be ACTIVE or INACTIVE."),
];
