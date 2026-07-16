const { body } = require("express-validator");

exports.createPaymentValidator = [
    body("studentId")
    .isInt()
    .withMessage("Student ID is required."),

    body("feeId")
    .isInt()
    .withMessage("Fee ID is required."),

    body("amountPaid")
    .isFloat({ min: 0.01 })
    .withMessage("Amount paid must be greater than zero."),

    body("paymentDate")
    .isISO8601()
    .withMessage("A valid payment date is required."),

    body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage("Payment method is required."),

    body("referenceNo")
    .optional()
    .trim(),

    body("status")
    .optional()
    .isIn(["Completed", "Pending", "Cancelled"])
    .withMessage(
        "Status must be Completed, Pending or Cancelled."
    ),
];

exports.updatePaymentValidator = [
    body("studentId")
    .optional()
    .isInt(),

    body("feeId")
    .optional()
    .isInt(),

    body("amountPaid")
    .optional()
    .isFloat({ min: 0.01 }),

    body("paymentDate")
    .optional()
    .isISO8601(),

    body("paymentMethod")
    .optional()
    .trim()
    .notEmpty(),

    body("referenceNo")
    .optional()
    .trim(),

    body("status")
    .optional()
    .isIn(["Completed", "Pending", "Cancelled"]),
];