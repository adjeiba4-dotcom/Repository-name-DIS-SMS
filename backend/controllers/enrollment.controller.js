// controllers/enrollment.controller.js

const enrollmentService = require("../services/enrollment.service");
const ApiResponse = require("../utils/response");

exports.getEnrollments = async(req, res, next) => {
    try {
        const enrollments =
            await enrollmentService.getEnrollments();

        return ApiResponse.success(
            res,
            "Enrollments retrieved successfully.",
            enrollments
        );
    } catch (error) {
        next(error);
    }
};

exports.getEnrollmentById = async(req, res, next) => {
    try {
        const enrollment =
            await enrollmentService.getEnrollmentById(
                req.params.id
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

exports.searchEnrollments = async(req, res, next) => {
    try {
        const { keyword } = req.query;

        const enrollments =
            await enrollmentService.searchEnrollments(
                keyword || ""
            );

        return ApiResponse.success(
            res,
            "Enrollment search completed successfully.",
            enrollments
        );
    } catch (error) {
        next(error);
    }
};

exports.createEnrollment = async(req, res, next) => {
    try {
        const enrollment =
            await enrollmentService.createEnrollment(
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

exports.updateEnrollment = async(req, res, next) => {
    try {
        const enrollment =
            await enrollmentService.updateEnrollment(
                req.params.id,
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

exports.deleteEnrollment = async(req, res, next) => {
    try {
        await enrollmentService.deleteEnrollment(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Enrollment deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};