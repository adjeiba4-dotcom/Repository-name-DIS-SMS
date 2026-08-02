// validators/paymentAllocation.validator.js

const { body, param, query } = require("express-validator");

const createPaymentAllocation = [
    body("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required.")
    .isInt({ min: 1 })
    .withMessage("Payment ID must be a valid integer."),

    body("invoiceId")
    .notEmpty()
    .withMessage("Invoice ID is required.")
    .isInt({ min: 1 })
    .withMessage("Invoice ID must be a valid integer."),

    body("amountApplied")
    .notEmpty()
    .withMessage("Allocated amount is required.")
    .isFloat({ gt: 0 })
    .withMessage("Allocated amount must be greater than zero."),
];

const updatePaymentAllocation = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Payment Allocation ID must be a valid integer."),

    body("amountApplied")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Allocated amount must be greater than zero."),
];

const validatePaymentAllocationId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Payment Allocation ID must be a valid integer."),
];

const searchPaymentAllocations = [
    query("keyword")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search keyword cannot exceed 100 characters."),
];

module.exports = {
    createPaymentAllocation,
    updatePaymentAllocation,
    validatePaymentAllocationId,
    searchPaymentAllocations,
};