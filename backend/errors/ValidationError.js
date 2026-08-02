const ApiError = require("./ApiError");

/**
 * Validation Error (400)
 */
class ValidationError extends ApiError {
    constructor(message = "Validation failed.", errors = []) {
        super(400, message, errors);
    }
}

module.exports = ValidationError;