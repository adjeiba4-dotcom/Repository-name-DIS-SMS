// controllers/reportCard.controller.js

const reportCardService = require("../services/reportCard.service");
const ApiResponse = require("../utils/response");

exports.getReportCards = async (req, res, next) => {
    try {
        const result = await reportCardService.getReportCards(req.query);
        return ApiResponse.paginated(
            res,
            "Report cards retrieved successfully.",
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

exports.getArchivedReportCards = async (req, res, next) => {
    try {
        const result = await reportCardService.getArchivedReportCards(req.query);
        return ApiResponse.paginated(
            res,
            "Archived report cards retrieved successfully.",
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
        const stats = await reportCardService.getStats(req.query);
        return ApiResponse.success(
            res,
            "Report card statistics retrieved successfully.",
            stats
        );
    } catch (error) {
        next(error);
    }
};

exports.getTemplates = async (req, res, next) => {
    try {
        const list = await reportCardService.getTemplates();
        return ApiResponse.success(
            res,
            "Report card templates retrieved successfully.",
            list
        );
    } catch (error) {
        next(error);
    }
};

exports.getReportCardById = async (req, res, next) => {
    try {
        const card = await reportCardService.getReportCardById(
            parseInt(req.params.id, 10)
        );
        return ApiResponse.success(
            res,
            "Report card retrieved successfully.",
            card
        );
    } catch (error) {
        next(error);
    }
};

exports.getPreview = async (req, res, next) => {
    try {
        const preview = await reportCardService.getPreview(
            parseInt(req.params.id, 10)
        );
        return ApiResponse.success(
            res,
            "Report card preview retrieved successfully.",
            preview
        );
    } catch (error) {
        next(error);
    }
};

exports.generateReportCard = async (req, res, next) => {
    try {
        const { card, created } = await reportCardService.generateReportCard(
            req.body,
            req.user
        );
        if (created) {
            return ApiResponse.created(
                res,
                "Report card generated successfully.",
                card
            );
        }
        return ApiResponse.success(
            res,
            "Report card regenerated successfully.",
            card
        );
    } catch (error) {
        next(error);
    }
};

exports.generateBulk = async (req, res, next) => {
    try {
        const result = await reportCardService.generateBulk(req.body, req.user);
        return ApiResponse.success(
            res,
            "Bulk report card generation completed.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.updateReportCard = async (req, res, next) => {
    try {
        const card = await reportCardService.updateReportCard(
            parseInt(req.params.id, 10),
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Report card updated successfully.",
            card
        );
    } catch (error) {
        next(error);
    }
};

exports.archiveReportCard = async (req, res, next) => {
    try {
        await reportCardService.archiveReportCard(
            parseInt(req.params.id, 10),
            req.user
        );
        return ApiResponse.success(res, "Report card archived successfully.");
    } catch (error) {
        next(error);
    }
};

exports.restoreReportCard = async (req, res, next) => {
    try {
        const card = await reportCardService.restoreReportCard(
            parseInt(req.params.id, 10)
        );
        return ApiResponse.success(
            res,
            "Report card restored successfully.",
            card
        );
    } catch (error) {
        next(error);
    }
};

exports.verifyReportCards = async (req, res, next) => {
    try {
        const result = await reportCardService.verifyReportCards(
            req.body,
            req.user
        );
        return ApiResponse.success(res, "Report cards verified successfully.", result);
    } catch (error) {
        next(error);
    }
};

exports.unverifyReportCards = async (req, res, next) => {
    try {
        const result = await reportCardService.unverifyReportCards(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Report cards unverified successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.publishReportCards = async (req, res, next) => {
    try {
        const result = await reportCardService.publishReportCards(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Report cards published successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.unpublishReportCards = async (req, res, next) => {
    try {
        const result = await reportCardService.unpublishReportCards(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Report cards unpublished successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.lockReportCards = async (req, res, next) => {
    try {
        const result = await reportCardService.lockReportCards(
            req.body,
            req.user
        );
        return ApiResponse.success(res, "Report cards locked successfully.", result);
    } catch (error) {
        next(error);
    }
};

exports.unlockReportCards = async (req, res, next) => {
    try {
        const result = await reportCardService.unlockReportCards(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Report cards unlocked successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};
