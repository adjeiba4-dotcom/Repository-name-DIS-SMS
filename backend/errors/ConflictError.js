const ApiError = require("./ApiError");

/**
 * Conflict Error (409)
 */
class ConflictError extends ApiError {
    constructor(message = "Conflict detected.", errors = []) {
        super(409, message, errors);
    }
}

module.exports = ConflictError;