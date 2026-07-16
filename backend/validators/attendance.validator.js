const { body } = require("express-validator");

exports.createAttendanceValidator = [
    body("studentId")
    .isInt()
    .withMessage("Student ID is required."),

    body("date")
    .isISO8601()
    .withMessage("A valid attendance date is required."),

    body("status")
    .isIn(["Present", "Absent", "Late", "Excused"])
    .withMessage(
        "Status must be Present, Absent, Late or Excused."
    ),
];

exports.updateAttendanceValidator = [
    body("studentId")
    .optional()
    .isInt(),

    body("date")
    .optional()
    .isISO8601(),

    body("status")
    .optional()
    .isIn(["Present", "Absent", "Late", "Excused"]),
];