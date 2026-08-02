/**
 * Base API Error
 * Parent class for all operational application errors.
 */
class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ApiError;