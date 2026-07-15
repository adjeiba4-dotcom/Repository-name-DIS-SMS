const { body } = require("express-validator");

exports.createClassValidator = [
    body("className")
    .trim()
    .notEmpty()
    .withMessage("Class name is required."),

    body("classCode")
    .trim()
    .notEmpty()
    .withMessage("Class code is required."),

    body("departmentId")
    .isInt()
    .withMessage("Department ID must be an integer."),

    body("teacherId")
    .optional()
    .isInt()
    .withMessage("Teacher ID must be an integer."),

    body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer."),
];

exports.updateClassValidator = [
    body("className")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Class name cannot be empty."),

    body("classCode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Class code cannot be empty."),

    body("departmentId")
    .optional()
    .isInt()
    .withMessage("Department ID must be an integer."),

    body("teacherId")
    .optional()
    .isInt()
    .withMessage("Teacher ID must be an integer."),

    body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer."),
];