const { body } = require("express-validator");

exports.createEnrollmentValidator = [
    body("studentId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("A valid Student is required."),

    body("classId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("A valid Class is required."),

    body("academicYearId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("A valid Academic Year is required."),

    body("termId")
    .notEmpty()
    .isInt({ min: 1 })
    .withMessage("A valid Term is required."),

    body("enrollmentDate")
    .notEmpty()
    .isISO8601()
    .withMessage("A valid enrollment date is required."),

    body("status")
    .optional()
    .isIn(["Active", "Transferred", "Graduated", "Withdrawn"])
    .withMessage(
        "Status must be Active, Transferred, Graduated, or Withdrawn."
    ),
];