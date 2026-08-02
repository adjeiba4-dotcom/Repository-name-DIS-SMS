// validators/studentInvoice.validator.js

const { body, param, query } = require("express-validator");

const createStudentInvoice = [
    body("studentId")
    .isInt({ min: 1 })
    .withMessage("Student ID is required."),

    body("feeStructureId")
    .isInt({ min: 1 })
    .withMessage("Fee Structure ID is required."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

const updateStudentInvoice = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid Student Invoice ID is required."),

    body("studentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Student ID must be a positive integer."),

    body("feeStructureId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Fee Structure ID must be a positive integer."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE."),
];

const validateStudentInvoiceId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid Student Invoice ID is required."),
];

const searchStudentInvoices = [
    query("keyword")
    .optional()
    .trim(),
];

module.exports = {
    createStudentInvoice,
    updateStudentInvoice,
    validateStudentInvoiceId,
    searchStudentInvoices,
};