// controllers/assessment.controller.js

const assessmentService = require("../services/assessment.service");
const ApiResponse = require("../utils/response");

exports.getAssessments = async (req, res, next) => {
    try {
        const result = await assessmentService.getAssessments(req.query);

        return ApiResponse.paginated(
            res,
            "Assessments retrieved successfully.",
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

exports.getArchivedAssessments = async (req, res, next) => {
    try {
        const result = await assessmentService.getArchivedAssessments(
            req.query
        );

        return ApiResponse.paginated(
            res,
            "Archived assessments retrieved successfully.",
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
        const stats = await assessmentService.getStats(req.query);

        return ApiResponse.success(
            res,
            "Assessment statistics retrieved successfully.",
            stats
        );
    } catch (error) {
        next(error);
    }
};

exports.getAssessmentById = async (req, res, next) => {
    try {
        const assessment = await assessmentService.getAssessmentById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Assessment retrieved successfully.",
            assessment
        );
    } catch (error) {
        next(error);
    }
};

exports.getRoster = async (req, res, next) => {
    try {
        const roster = await assessmentService.getRoster(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Assessment score roster retrieved successfully.",
            roster
        );
    } catch (error) {
        next(error);
    }
};

exports.createAssessment = async (req, res, next) => {
    try {
        const assessment = await assessmentService.createAssessment(req.body);

        return ApiResponse.created(
            res,
            "Assessment created successfully.",
            assessment
        );
    } catch (error) {
        next(error);
    }
};

exports.updateAssessment = async (req, res, next) => {
    try {
        const assessment = await assessmentService.updateAssessment(
            parseInt(req.params.id, 10),
            req.body
        );

        return ApiResponse.success(
            res,
            "Assessment updated successfully.",
            assessment
        );
    } catch (error) {
        next(error);
    }
};

exports.archiveAssessment = async (req, res, next) => {
    try {
        await assessmentService.archiveAssessment(parseInt(req.params.id, 10));

        return ApiResponse.success(
            res,
            "Assessment archived successfully."
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreAssessment = async (req, res, next) => {
    try {
        const assessment = await assessmentService.restoreAssessment(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Assessment restored successfully.",
            assessment
        );
    } catch (error) {
        next(error);
    }
};

exports.bulkScores = async (req, res, next) => {
    try {
        const result = await assessmentService.bulkScores(
            parseInt(req.params.id, 10),
            req.body
        );

        return ApiResponse.success(
            res,
            "Assessment scores processed successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};
