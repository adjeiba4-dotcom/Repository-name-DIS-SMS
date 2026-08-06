// controllers/class.controller.js

const classService = require("../services/class.service");
const ApiResponse = require("../utils/response");

function actorFrom(req) {
    return {
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get?.("user-agent") || null,
    };
}

exports.getClasses = async (req, res, next) => {
    try {
        const result = await classService.getClasses(req.query);

        return ApiResponse.paginated(
            res,
            "Classes retrieved successfully.",
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

exports.getClassById = async (req, res, next) => {
    try {
        const schoolClass = await classService.getClassById(
            parseInt(req.params.id, 10)
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

exports.getArchivedClasses = async (req, res, next) => {
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

exports.createClass = async (req, res, next) => {
    try {
        const schoolClass = await classService.createClass(
            req.body,
            actorFrom(req)
        );

        return ApiResponse.created(
            res,
            "Class created successfully.",
            schoolClass
        );
    } catch (error) {
        next(error);
    }
};

exports.updateClass = async (req, res, next) => {
    try {
        const schoolClass = await classService.updateClass(
            parseInt(req.params.id, 10),
            req.body,
            actorFrom(req)
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

exports.deleteClass = async (req, res, next) => {
    try {
        const schoolClass = await classService.deleteClass(
            parseInt(req.params.id, 10),
            actorFrom(req)
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

exports.restoreClass = async (req, res, next) => {
    try {
        const activate =
            req.body?.activate === true || req.query?.activate === "true";

        const schoolClass = await classService.restoreClass(
            parseInt(req.params.id, 10),
            { activate },
            actorFrom(req)
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
