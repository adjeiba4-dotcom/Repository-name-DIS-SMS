const ApiError = require("./ApiError");

/**
 * Business Rule Error (422)
 */
class BusinessRuleError extends ApiError {
    constructor(message = "Business rule violation.") {
        super(422, message);
    }
}

module.exports = BusinessRuleError;