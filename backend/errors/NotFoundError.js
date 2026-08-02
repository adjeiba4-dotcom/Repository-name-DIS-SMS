const ApiError = require("./ApiError");

/**
 * Not Found Error (404)
 */
class NotFoundError extends ApiError {
    constructor(message = "Resource not found.") {
        super(404, message);
    }
}

module.exports = NotFoundError;