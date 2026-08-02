const ApiError = require("./ApiError");

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized.") {
        super(401, message);
    }
}

module.exports = UnauthorizedError;