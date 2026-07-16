const { body } = require("express-validator");

exports.createEnrollmentValidator = [
    body("studentId")
    .isInt()
    .withMessage("Student ID is required."),

    body("classId")
    .isInt()
    .withMessage("Class ID is required."),

    body("academicYearId")
    .isInt()
    .withMessage("Academic Year ID is required."),

    body("enrollmentDate")
    .optional()
    .isISO8601()
    .withMessage("Enrollment date must be valid."),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"])
    .withMessage("Status must be Active or Inactive."),
];

exports.updateEnrollmentValidator = [
    body("studentId")
    .optional()
    .isInt(),

    body("classId")
    .optional()
    .isInt(),

    body("academicYearId")
    .optional()
    .isInt(),

    body("enrollmentDate")
    .optional()
    .isISO8601(),

    body("status")
    .optional()
    .isIn(["Active", "Inactive"]),
];