// controllers/enrollment.controller.js

const enrollmentService = require("../services/enrollment.service");
const ApiResponse = require("../utils/response");

exports.getEnrollments = async (req, res, next) => {
    try {
        const result = await enrollmentService.getEnrollments(req.query);

        return ApiResponse.paginated(
            res,
            "Enrollments retrieved successfully.",
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

exports.getEnrollmentById = async (req, res, next) => {
    try {
        const enrollment = await enrollmentService.getEnrollmentById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Enrollment retrieved successfully.",
            enrollment
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedEnrollments = async (req, res, next) => {
    try {
        const enrollments =
            await enrollmentService.getArchivedEnrollments();

        return ApiResponse.success(
            res,
            "Archived enrollments retrieved successfully.",
            enrollments
        );
    } catch (error) {
        next(error);
    }
};

exports.createEnrollment = async (req, res, next) => {
    try {
        const enrollment = await enrollmentService.createEnrollment(
            req.body
        );

        return ApiResponse.created(
            res,
            "Enrollment created successfully.",
            enrollment
        );
    } catch (error) {
        next(error);
    }
};

exports.updateEnrollment = async (req, res, next) => {
    try {
        const enrollment = await enrollmentService.updateEnrollment(
            parseInt(req.params.id, 10),
            req.body
        );

        return ApiResponse.success(
            res,
            "Enrollment updated successfully.",
            enrollment
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteEnrollment = async (req, res, next) => {
    try {
        const enrollment = await enrollmentService.deleteEnrollment(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Enrollment archived successfully.",
            enrollment
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreEnrollment = async (req, res, next) => {
    try {
        const activate =
            req.body?.activate === true || req.query?.activate === "true";

        const enrollment = await enrollmentService.restoreEnrollment(
            parseInt(req.params.id, 10),
            { activate }
        );

        return ApiResponse.success(
            res,
            "Enrollment restored successfully.",
            enrollment
        );
    } catch (error) {
        next(error);
    }
};
