const ApiError = require("./ApiError");

/**
 * Bad Request Error (400)
 */
class BadRequestError extends ApiError {
    constructor(message = "Bad request.") {
        super(400, message);
    }
}

module.exports = BadRequestError;