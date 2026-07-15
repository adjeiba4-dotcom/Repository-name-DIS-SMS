const { body } = require("express-validator");

exports.createSubjectValidator = [
    body("subjectName")
    .notEmpty()
    .withMessage("Subject name is required."),

    body("subjectCode")
    .notEmpty()
    .withMessage("Subject code is required."),

    body("description")
    .optional()
    .isString()
    .withMessage("Description must be text."),
];