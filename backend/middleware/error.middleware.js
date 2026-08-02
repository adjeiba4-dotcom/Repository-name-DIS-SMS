// middleware/error.middleware.js

const ApiResponse = require("../utils/response");
const { ApiError } = require("../errors");

/**
 * Global Error Handler
 * Handles all application errors and returns
 * a standardized API response.
 */
const errorHandler = (err, req, res, next) => {
    console.error("========================================");
    console.error("ERROR:", err.message);
    console.error(err.stack);
    console.error("========================================");

    /**
     * Express Validator Errors
     */
    if (err.array && typeof err.array === "function") {
        return ApiResponse.validationError(
            res,
            err.array(),
            "Validation failed."
        );
    }

    /**
     * Prisma Errors
     */

    // Unique Constraint
    if (err.code === "P2002") {
        return ApiResponse.error(
            res,
            "A record with this value already exists.",
            409
        );
    }

    // Record Not Found
    if (err.code === "P2025") {
        return ApiResponse.error(
            res,
            "Requested record was not found.",
            404
        );
    }

    // Foreign Key Constraint
    if (err.code === "P2003") {
        return ApiResponse.error(
            res,
            "Operation violates a database relationship.",
            400
        );
    }

    /**
     * Enterprise API Errors
     */
    if (err instanceof ApiError) {
        return ApiResponse.error(
            res,
            err.message,
            err.statusCode,
            err.errors
        );
    }

    /**
     * Legacy Support
     */
    if (err.statusCode) {
        return ApiResponse.error(
            res,
            err.message,
            err.statusCode,
            err.errors || null
        );
    }

    /**
     * Unknown Errors
     */
    return ApiResponse.error(
        res,
        process.env.NODE_ENV === "production" ?
        "Internal server error." :
        err.message,
        500
    );
};

module.exports = errorHandler;