// utils/response.js

/**
 * Standard API Response Helper
 * Ensures consistent JSON responses across the DIS-SMS API.
 */
class ApiResponse {
    /**
     * Success Response
     */
    static success(
        res,
        message = "Success",
        data = null,
        statusCode = 200
    ) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Resource Created Response
     */
    static created(
        res,
        message = "Resource created successfully.",
        data = null
    ) {
        return res.status(201).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Error Response
     */
    static error(
        res,
        message = "An unexpected error occurred.",
        statusCode = 500,
        errors = null
    ) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Validation Error Response
     */
    static validationError(
        res,
        errors,
        message = "Validation failed."
    ) {
        return res.status(422).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Paginated Response
     */
    static paginated(
        res,
        message = "Data retrieved successfully.",
        data = [],
        pagination = {}
    ) {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination,
            timestamp: new Date().toISOString(),
        });
    }
}

module.exports = ApiResponse;