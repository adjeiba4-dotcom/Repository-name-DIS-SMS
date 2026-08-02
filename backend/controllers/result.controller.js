const resultService = require("../services/result.service");
const ApiResponse = require("../utils/response");

/**
 * Get all results
 */
exports.getResults = async(req, res, next) => {
    try {
        const results = await resultService.getResults();

        return ApiResponse.success(
            res,
            "Results retrieved successfully.",
            results
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get result by ID
 */
exports.getResultById = async(req, res, next) => {
    try {
        const result =
            await resultService.getResultById(
                Number(req.params.id)
            );

        return ApiResponse.success(
            res,
            "Result retrieved successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search results
 */
exports.searchResults = async(req, res, next) => {
    try {
        const results =
            await resultService.searchResults(
                req.query.keyword || ""
            );

        return ApiResponse.success(
            res,
            "Result search completed successfully.",
            results
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create result
 */
exports.createResult = async(req, res, next) => {
    try {
        const result =
            await resultService.createResult(
                req.body
            );

        return ApiResponse.created(
            res,
            "Result created successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update result
 */
exports.updateResult = async(req, res, next) => {
    try {
        const result =
            await resultService.updateResult(
                Number(req.params.id),
                req.body
            );

        return ApiResponse.success(
            res,
            "Result updated successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete result
 */
exports.deleteResult = async(req, res, next) => {
    try {
        await resultService.deleteResult(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Result deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};