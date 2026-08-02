const { param } = require("express-validator");
const { validate } = require("./validation.middleware");

const validateId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer."),
    validate,
];

module.exports = {
    validateId,
};