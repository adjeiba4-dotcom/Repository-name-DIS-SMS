const { body } = require("express-validator");

exports.createAttendanceValidator = [
    body("studentId")
    .isInt({ min: 1 })
    .withMessage("Valid student is required."),

    body("classId")
    .isInt({ min: 1 })
    .withMessage("Valid class is required."),

    body("academicYearId")
    .isInt({ min: 1 })
    .withMessage("Valid academic year is required."),

    body("termId")
    .isInt({ min: 1 })
    .withMessage("Valid term is required."),

    body("attendanceDate")
    .isISO8601()
    .withMessage("Valid attendance date is required."),

    body("status")
    .isIn(["Present", "Absent", "Late", "Excused"])
    .withMessage("Status must be Present, Absent, Late or Excused."),
];