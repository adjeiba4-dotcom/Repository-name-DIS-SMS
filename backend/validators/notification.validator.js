const { body } = require("express-validator");

exports.createNotificationValidator = [
    body("title")
    .notEmpty()
    .withMessage("Notification title is required."),

    body("message")
    .notEmpty()
    .withMessage("Notification message is required."),

    body("recipientType")
    .isIn(["All", "Student", "Teacher", "Parent", "Staff"])
    .withMessage(
        "Recipient type must be All, Student, Teacher, Parent or Staff."
    ),

    body("status")
    .optional()
    .isIn(["Pending", "Sent", "Failed"])
    .withMessage("Status must be Pending, Sent or Failed."),
];