// validators/dashboardWidget.validator.js

const { body, param, query } = require("express-validator");
const { validate } = require("../middleware/validation.middleware");

const createWidgetValidator = [
    body("dashboardId")
    .isInt({ min: 1 })
    .withMessage("Dashboard ID is required."),

    body("title")
    .trim()
    .notEmpty()
    .withMessage("Widget title is required.")
    .isLength({ max: 100 })
    .withMessage("Widget title cannot exceed 100 characters."),

    body("widgetType")
    .trim()
    .notEmpty()
    .withMessage("Widget type is required."),

    body("dataSource")
    .trim()
    .notEmpty()
    .withMessage("Data source is required."),

    body("positionX")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Position X must be a positive integer."),

    body("positionY")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Position Y must be a positive integer."),

    body("width")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Width must be at least 1."),

    body("height")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Height must be at least 1."),

    body("configuration")
    .optional()
    .isObject()
    .withMessage("Configuration must be a JSON object."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status."),

    validate,
];

const updateWidgetValidator = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid widget ID."),

    body("dashboardId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Dashboard ID must be valid."),

    body("title")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Widget title cannot exceed 100 characters."),

    body("widgetType")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Widget type cannot be empty."),

    body("dataSource")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Data source cannot be empty."),

    body("positionX")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Position X must be a positive integer."),

    body("positionY")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Position Y must be a positive integer."),

    body("width")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Width must be at least 1."),

    body("height")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Height must be at least 1."),

    body("configuration")
    .optional()
    .isObject()
    .withMessage("Configuration must be a JSON object."),

    body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status."),

    validate,
];

const widgetIdValidator = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid widget ID."),

    validate,
];

const dashboardIdValidator = [
    param("dashboardId")
    .isInt({ min: 1 })
    .withMessage("Invalid dashboard ID."),

    validate,
];

const searchWidgetValidator = [
    query("keyword")
    .optional()
    .isString()
    .withMessage("Keyword must be text."),

    validate,
];

const updatePositionValidator = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid widget ID."),

    body("positionX")
    .isInt({ min: 0 })
    .withMessage("Position X is required."),

    body("positionY")
    .isInt({ min: 0 })
    .withMessage("Position Y is required."),

    validate,
];

const updateSizeValidator = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid widget ID."),

    body("width")
    .isInt({ min: 1 })
    .withMessage("Width is required."),

    body("height")
    .isInt({ min: 1 })
    .withMessage("Height is required."),

    validate,
];

module.exports = {
    createWidgetValidator,
    updateWidgetValidator,
    widgetIdValidator,
    dashboardIdValidator,
    searchWidgetValidator,
    updatePositionValidator,
    updateSizeValidator,
};