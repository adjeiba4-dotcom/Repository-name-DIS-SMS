const { body } = require("express-validator");

exports.createResultValidator = [
    body("studentId")
    .isInt({ min: 1 })
    .withMessage("Valid Student is required."),

    body("examinationId")
    .isInt({ min: 1 })
    .withMessage("Valid Examination is required."),

    body("subjectId")
    .isInt({ min: 1 })
    .withMessage("Valid Subject is required."),

    body("classId")
    .isInt({ min: 1 })
    .withMessage("Valid Class is required."),

    body("academicYearId")
    .isInt({ min: 1 })
    .withMessage("Valid Academic Year is required."),

    body("termId")
    .isInt({ min: 1 })
    .withMessage("Valid Term is required."),

    body("marks")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Marks must be between 0 and 100."),

    body("grade")
    .notEmpty()
    .withMessage("Grade is required."),

    body("remarks")
    .optional()
    .isString()
    .withMessage("Remarks must be text."),
];