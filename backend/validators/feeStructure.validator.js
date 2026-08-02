// validators/feeStructure.validator.js

const { body, param, query } = require("express-validator");

const createFeeStructure = [
    body("academicYearId")
    .isInt({ min: 1 })
    .withMessage("Academic Year ID is required."),

    body("classId")
    .isInt({ min: 1 })
    .withMessage("School Class ID is required."),

    body("feeTypeId")
    .isInt({ min: 1 })
    .withMessage("Fee Type ID is required."),

    body("amount")
    .notEmpty()
    .withMessage("Amount is required.")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid decimal number.")
    .custom((value) => Number(value) > 0)
    .withMessage("Amount must be greater than zero."),

    body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

const updateFeeStructure = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid Fee Structure ID is required."),

    body("academicYearId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Academic Year ID must be a positive integer."),

    body("classId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("School Class ID must be a positive integer."),

    body("feeTypeId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Fee Type ID must be a positive integer."),

    body("amount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid decimal number.")
    .custom((value) => Number(value) > 0)
    .withMessage("Amount must be greater than zero."),

    body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

const validateFeeStructureId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid Fee Structure ID is required."),
];

const searchFeeStructures = [
    query("keyword")
    .optional()
    .trim(),
];

module.exports = {
    createFeeStructure,
    updateFeeStructure,
    validateFeeStructureId,
    searchFeeStructures,
};