const { body } = require("express-validator");

exports.createFeeValidator = [
    body("feeName")
    .notEmpty()
    .withMessage("Fee name is required."),

    body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be greater than or equal to 0."),

    body("academicYearId")
    .isInt({ min: 1 })
    .withMessage("Valid Academic Year is required."),

    body("termId")
    .isInt({ min: 1 })
    .withMessage("Valid Term is required."),

    body("classId")
    .isInt({ min: 1 })
    .withMessage("Valid Class is required."),

    body("description")
    .optional()
    .isString()
    .withMessage("Description must be text."),
];