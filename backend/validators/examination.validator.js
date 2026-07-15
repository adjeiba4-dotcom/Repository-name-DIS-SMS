const { body } = require("express-validator");

exports.createExaminationValidator = [
    body("examName")
    .notEmpty()
    .withMessage("Examination name is required."),

    body("examDate")
    .isISO8601()
    .withMessage("Valid examination date is required."),

    body("academicYearId")
    .isInt({ min: 1 })
    .withMessage("Valid Academic Year is required."),

    body("termId")
    .isInt({ min: 1 })
    .withMessage("Valid Term is required."),

    body("classId")
    .isInt({ min: 1 })
    .withMessage("Valid Class is required."),

    body("subjectId")
    .isInt({ min: 1 })
    .withMessage("Valid Subject is required."),
];