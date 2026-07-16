const { body } = require("express-validator");

exports.loginValidator = [
    body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required."),

    body("password")
    .notEmpty()
    .withMessage("Password is required."),
];