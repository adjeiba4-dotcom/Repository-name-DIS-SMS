const { body } = require("express-validator");

exports.createUserValidator = [
    body("firstName").trim().notEmpty().withMessage("First name is required."),
    body("lastName").trim().notEmpty().withMessage("Last name is required."),
    body("email").trim().isEmail().withMessage("A valid email is required."),
    body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
    body("role").notEmpty().withMessage("Role is required."),
];

exports.updateUserValidator = [
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim().notEmpty(),
    body("email").optional().isEmail(),
    body("password").optional().isLength({ min: 6 }),
    body("role").optional().notEmpty(),
];