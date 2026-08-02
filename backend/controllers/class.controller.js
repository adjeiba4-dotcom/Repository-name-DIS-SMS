const classService = require("../services/class.service");
const ApiResponse = require("../utils/response");

/**
 * Get all classes
 */
exports.getClasses = async(req, res, next) => {
    try {
        const classes = await classService.getClasses();

        return ApiResponse.success(
            res,
            "Classes retrieved successfully.",
            classes
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get class by ID
 */
exports.getClassById = async(req, res, next) => {
    try {
        const schoolClass = await classService.getClassById(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Class retrieved successfully.",
            schoolClass
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search classes
 */
exports.searchClasses = async(req, res, next) => {
    try {
        const classes = await classService.searchClasses(
            req.query.keyword
        );

        return ApiResponse.success(
            res,
            "Classes retrieved successfully.",
            classes
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get archived classes
 */
exports.getArchivedClasses = async(req, res, next) => {
    try {
        const classes = await classService.getArchivedClasses();

        return ApiResponse.success(
            res,
            "Archived classes retrieved successfully.",
            classes
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create class
 */
exports.createClass = async(req, res, next) => {
    try {
        const schoolClass = await classService.createClass(req.body);

        return ApiResponse.created(
            res,
            "Class created successfully.",
            schoolClass
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update class
 */
exports.updateClass = async(req, res, next) => {
    try {
        const schoolClass = await classService.updateClass(
            Number(req.params.id),
            req.body
        );

        return ApiResponse.success(
            res,
            "Class updated successfully.",
            schoolClass
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Archive class
 */
exports.deleteClass = async(req, res, next) => {
    try {
        const schoolClass = await classService.deleteClass(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Class archived successfully.",
            schoolClass
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Restore archived class
 */
exports.restoreClass = async(req, res, next) => {
    try {
        const schoolClass = await classService.restoreClass(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Class restored successfully.",
            schoolClass
        );
    } catch (error) {
        next(error);
    }
};