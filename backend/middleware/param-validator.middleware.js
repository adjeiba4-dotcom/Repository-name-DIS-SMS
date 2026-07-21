const { param, validationResult } = require("express-validator");

/**
 * Validate numeric ID route parameters.
 * Example:
 * GET /students/15
 */
const validateId = [
    param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid resource ID."),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors: errors.array(),
            });
        }

        next();
    },
];

module.exports = {
    validateId,
};