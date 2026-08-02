// validators/receipt.validator.js

const { body, param, query } = require("express-validator");

const createReceipt = [
    body("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required.")
    .isInt({ min: 1 })
    .withMessage("Payment ID must be a valid integer."),

    body("printedBy")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Printed By must be a valid user ID."),

    body("remarks")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

const updateReceipt = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Receipt ID must be a valid integer."),

    body("printedBy")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Printed By must be a valid user ID."),

    body("remarks")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

const validateReceiptId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Receipt ID must be a valid integer."),
];

const searchReceipts = [
    query("keyword")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search keyword cannot exceed 100 characters."),
];

module.exports = {
    createReceipt,
    updateReceipt,
    validateReceiptId,
    searchReceipts,
};