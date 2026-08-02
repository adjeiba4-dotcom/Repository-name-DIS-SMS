// validators/payment.validator.js

const { body, param, query } = require("express-validator");

const createPayment = [
    body("studentId")
    .isInt({ min: 1 })
    .withMessage("Student ID is required."),

    body("amount")
    .notEmpty()
    .withMessage("Payment amount is required.")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Payment amount must be a valid decimal number.")
    .custom((value) => Number(value) > 0)
    .withMessage("Payment amount must be greater than zero."),

    body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required.")
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Payment method must be between 2 and 50 characters."),

    body("referenceNo")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Reference number cannot exceed 100 characters."),

    body("remarks")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Remarks cannot exceed 255 characters."),
];

const updatePayment = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid Payment ID is required."),

    body("studentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Student ID must be a positive integer."),

    body("amount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Payment amount must be a valid decimal number.")
    .custom((value) => Number(value) > 0)
    .withMessage("Payment amount must be greater than zero."),

    body("paymentMethod")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Payment method must be between 2 and 50 characters."),

    body("referenceNo")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Reference number cannot exceed 100 characters."),

    body("remarks")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Remarks cannot exceed 255 characters."),
];

const validatePaymentId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Valid Payment ID is required."),
];

const searchPayments = [
    query("keyword")
    .optional()
    .trim(),
];

module.exports = {
    createPayment,
    updatePayment,
    validatePaymentId,
    searchPayments,
};