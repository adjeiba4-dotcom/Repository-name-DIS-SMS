const { body } = require("express-validator");

exports.createPaymentValidator = [
    body("studentId")
    .isInt({ min: 1 })
    .withMessage("Valid Student is required."),

    body("feeId")
    .isInt({ min: 1 })
    .withMessage("Valid Fee is required."),

    body("academicYearId")
    .isInt({ min: 1 })
    .withMessage("Valid Academic Year is required."),

    body("termId")
    .isInt({ min: 1 })
    .withMessage("Valid Term is required."),

    body("amountPaid")
    .isFloat({ min: 0.01 })
    .withMessage("Amount paid must be greater than zero."),

    body("paymentDate")
    .isISO8601()
    .withMessage("Valid payment date is required."),

    body("paymentMethod")
    .isIn(["Cash", "Mobile Money", "Bank Transfer", "Card"])
    .withMessage("Payment method must be Cash, Mobile Money, Bank Transfer or Card."),

    body("receiptNumber")
    .notEmpty()
    .withMessage("Receipt number is required."),

    body("remarks")
    .optional()
    .isString()
    .withMessage("Remarks must be text."),
];