const guardianService = require("../services/guardian.service");
const ApiResponse = require("../utils/response");

/**
 * Get all guardians
 */
exports.getGuardians = async (req, res, next) => {
    try {
        const guardians = await guardianService.getGuardians();

        return ApiResponse.success(
            res,
            "Guardians retrieved successfully.",
            guardians
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get guardian by ID
 */
exports.getGuardianById = async (req, res, next) => {
    try {
        const guardian = await guardianService.getGuardianById(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Guardian retrieved successfully.",
            guardian
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search guardians
 */
exports.searchGuardians = async (req, res, next) => {
    try {
        const keyword = req.query.keyword || "";

        const guardians =
            await guardianService.searchGuardians(keyword);

        return ApiResponse.success(
            res,
            "Search completed successfully.",
            guardians
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get archived guardians
 */
exports.getArchivedGuardians = async (req, res, next) => {
    try {
        const guardians =
            await guardianService.getArchivedGuardians();

        return ApiResponse.success(
            res,
            "Archived guardians retrieved successfully.",
            guardians
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create guardian
 */
exports.createGuardian = async (req, res, next) => {
    try {
        const guardian =
            await guardianService.createGuardian(req.body);

        return ApiResponse.created(
            res,
            "Guardian created successfully.",
            guardian
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update guardian
 */
exports.updateGuardian = async (req, res, next) => {
    try {
        const guardian =
            await guardianService.updateGuardian(
                req.params.id,
                req.body
            );

        return ApiResponse.success(
            res,
            "Guardian updated successfully.",
            guardian
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Archive guardian
 */
exports.deleteGuardian = async (req, res, next) => {
    try {
        await guardianService.deleteGuardian(req.params.id);

        return ApiResponse.success(
            res,
            "Guardian archived successfully."
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Restore guardian
 */
exports.restoreGuardian = async (req, res, next) => {
    try {
        const guardian =
            await guardianService.restoreGuardian(
                req.params.id
            );

        return ApiResponse.success(
            res,
            "Guardian restored successfully.",
            guardian
        );
    } catch (error) {
        next(error);
    }
};