const { body } = require("express-validator");

exports.createFeeValidator = [
    body("feeName")
    .trim()
    .notEmpty()
    .withMessage("Fee name is required."),

    body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number."),

    body("classId")
    .isInt()
    .withMessage("Class ID is required."),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive."),
];

exports.updateFeeValidator = [
    body("feeName")
    .optional()
    .trim()
    .notEmpty(),

    body("amount")
    .optional()
    .isFloat({ min: 0 }),

    body("classId")
    .optional()
    .isInt(),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"]),
];