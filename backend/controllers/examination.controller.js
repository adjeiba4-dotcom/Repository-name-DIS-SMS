// controllers/examination.controller.js

const examinationService = require("../services/examination.service");
const ApiResponse = require("../utils/response");

exports.getExaminations = async (req, res, next) => {
    try {
        const result = await examinationService.getExaminations(req.query);

        return ApiResponse.paginated(
            res,
            "Examinations retrieved successfully.",
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

exports.getArchivedExaminations = async (req, res, next) => {
    try {
        const result = await examinationService.getArchivedExaminations(
            req.query
        );

        return ApiResponse.paginated(
            res,
            "Archived examinations retrieved successfully.",
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
        const stats = await examinationService.getStats(req.query);

        return ApiResponse.success(
            res,
            "Examination statistics retrieved successfully.",
            stats
        );
    } catch (error) {
        next(error);
    }
};

exports.getExaminationById = async (req, res, next) => {
    try {
        const examination = await examinationService.getExaminationById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Examination retrieved successfully.",
            examination
        );
    } catch (error) {
        next(error);
    }
};

exports.getRoster = async (req, res, next) => {
    try {
        const roster = await examinationService.getRoster(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Examination score roster retrieved successfully.",
            roster
        );
    } catch (error) {
        next(error);
    }
};

exports.createExamination = async (req, res, next) => {
    try {
        const examination = await examinationService.createExamination(
            req.body
        );

        return ApiResponse.created(
            res,
            "Examination created successfully.",
            examination
        );
    } catch (error) {
        next(error);
    }
};

exports.updateExamination = async (req, res, next) => {
    try {
        const examination = await examinationService.updateExamination(
            parseInt(req.params.id, 10),
            req.body,
            req.user
        );

        return ApiResponse.success(
            res,
            "Examination updated successfully.",
            examination
        );
    } catch (error) {
        next(error);
    }
};

exports.archiveExamination = async (req, res, next) => {
    try {
        await examinationService.archiveExamination(
            parseInt(req.params.id, 10),
            req.user
        );

        return ApiResponse.success(
            res,
            "Examination archived successfully."
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreExamination = async (req, res, next) => {
    try {
        const examination = await examinationService.restoreExamination(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Examination restored successfully.",
            examination
        );
    } catch (error) {
        next(error);
    }
};

exports.lockExamination = async (req, res, next) => {
    try {
        const examination = await examinationService.lockExamination(
            parseInt(req.params.id, 10),
            req.user
        );

        return ApiResponse.success(
            res,
            "Examination locked successfully.",
            examination
        );
    } catch (error) {
        next(error);
    }
};

exports.unlockExamination = async (req, res, next) => {
    try {
        const examination = await examinationService.unlockExamination(
            parseInt(req.params.id, 10),
            req.user
        );

        return ApiResponse.success(
            res,
            "Examination unlocked successfully.",
            examination
        );
    } catch (error) {
        next(error);
    }
};

exports.bulkScores = async (req, res, next) => {
    try {
        const result = await examinationService.bulkScores(
            parseInt(req.params.id, 10),
            req.body,
            req.user
        );

        return ApiResponse.success(
            res,
            "Examination scores processed successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};
