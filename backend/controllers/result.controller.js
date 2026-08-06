// controllers/result.controller.js

const resultService = require("../services/result.service");
const ApiResponse = require("../utils/response");

exports.getResults = async (req, res, next) => {
    try {
        const result = await resultService.getResults(req.query);
        return ApiResponse.paginated(
            res,
            "Results retrieved successfully.",
            result.data,
            {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            }
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedResults = async (req, res, next) => {
    try {
        const result = await resultService.getArchivedResults(req.query);
        return ApiResponse.paginated(
            res,
            "Archived results retrieved successfully.",
            result.data,
            {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            }
        );
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const stats = await resultService.getStats(req.query);
        return ApiResponse.success(
            res,
            "Result statistics retrieved successfully.",
            stats
        );
    } catch (error) {
        next(error);
    }
};

exports.getWeightings = async (req, res, next) => {
    try {
        const weightings = await resultService.getWeightings();
        return ApiResponse.success(
            res,
            "Result weightings and grade bands retrieved successfully.",
            weightings
        );
    } catch (error) {
        next(error);
    }
};

exports.getBroadsheet = async (req, res, next) => {
    try {
        const broadsheet = await resultService.getBroadsheet(req.query);
        return ApiResponse.success(
            res,
            "Class broadsheet retrieved successfully.",
            broadsheet
        );
    } catch (error) {
        next(error);
    }
};

exports.getMeritList = async (req, res, next) => {
    try {
        const meritList = await resultService.getMeritList(req.query);
        return ApiResponse.success(
            res,
            "Merit list retrieved successfully.",
            meritList
        );
    } catch (error) {
        next(error);
    }
};

exports.getStudentProfile = async (req, res, next) => {
    try {
        const profile = await resultService.getStudentProfile(
            parseInt(req.params.studentId, 10),
            req.query
        );
        return ApiResponse.success(
            res,
            "Student result profile retrieved successfully.",
            profile
        );
    } catch (error) {
        next(error);
    }
};

exports.getResultById = async (req, res, next) => {
    try {
        const result = await resultService.getResultById(
            parseInt(req.params.id, 10)
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

exports.generateResults = async (req, res, next) => {
    try {
        const result = await resultService.generateResults(req.body, req.user);
        return ApiResponse.success(
            res,
            "Results generated successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.createResult = async (req, res, next) => {
    try {
        const result = await resultService.createResult(req.body, req.user);
        return ApiResponse.created(
            res,
            "Result created successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.updateResult = async (req, res, next) => {
    try {
        const result = await resultService.updateResult(
            parseInt(req.params.id, 10),
            req.body,
            req.user
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

exports.archiveResult = async (req, res, next) => {
    try {
        await resultService.archiveResult(
            parseInt(req.params.id, 10),
            req.user
        );
        return ApiResponse.success(res, "Result archived successfully.");
    } catch (error) {
        next(error);
    }
};

exports.restoreResult = async (req, res, next) => {
    try {
        const result = await resultService.restoreResult(
            parseInt(req.params.id, 10),
            req.user
        );
        return ApiResponse.success(
            res,
            "Result restored successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.verifyResults = async (req, res, next) => {
    try {
        const results = await resultService.verifyResults(req.body, req.user);
        return ApiResponse.success(
            res,
            "Results verified successfully.",
            results
        );
    } catch (error) {
        next(error);
    }
};

exports.unverifyResults = async (req, res, next) => {
    try {
        const results = await resultService.unverifyResults(req.body, req.user);
        return ApiResponse.success(
            res,
            "Results unverified successfully.",
            results
        );
    } catch (error) {
        next(error);
    }
};

exports.publishResults = async (req, res, next) => {
    try {
        const results = await resultService.publishResults(req.body, req.user);
        return ApiResponse.success(
            res,
            "Results published successfully.",
            results
        );
    } catch (error) {
        next(error);
    }
};

exports.unpublishResults = async (req, res, next) => {
    try {
        const results = await resultService.unpublishResults(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Results unpublished successfully.",
            results
        );
    } catch (error) {
        next(error);
    }
};

exports.lockResults = async (req, res, next) => {
    try {
        const results = await resultService.lockResults(req.body, req.user);
        return ApiResponse.success(res, "Results locked successfully.", results);
    } catch (error) {
        next(error);
    }
};

exports.unlockResults = async (req, res, next) => {
    try {
        const results = await resultService.unlockResults(req.body, req.user);
        return ApiResponse.success(
            res,
            "Results unlocked successfully.",
            results
        );
    } catch (error) {
        next(error);
    }
};

exports.recalculatePositions = async (req, res, next) => {
    try {
        const result = await resultService.recalculatePositions(req.body);
        return ApiResponse.success(
            res,
            "Result positions recalculated successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};
