const ApiError = require("./ApiError");

/**
 * Conflict Error (409)
 */
class ConflictError extends ApiError {
    constructor(message = "Conflict detected.") {
        super(409, message);
    }
}

module.exports = ConflictError;