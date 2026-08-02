const ApiError = require("./ApiError");

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends ApiError {
    constructor(message = "Access denied.") {
        super(403, message);
    }
}

module.exports = ForbiddenError;