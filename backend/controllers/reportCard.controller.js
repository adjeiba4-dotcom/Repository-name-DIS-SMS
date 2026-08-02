const reportCardService = require("../services/reportCard.service");
const ApiResponse = require("../utils/response");

/**
 * Get all report cards
 */
const getReportCards = async(req, res, next) => {
    try {
        const reportCards =
            await reportCardService.getReportCards();

        return ApiResponse.success(
            res,
            "Report cards retrieved successfully.",
            reportCards
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get report card by ID
 */
const getReportCardById = async(req, res, next) => {
    try {
        const reportCard =
            await reportCardService.getReportCardById(
                Number(req.params.id)
            );

        return ApiResponse.success(
            res,
            "Report card retrieved successfully.",
            reportCard
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search report cards
 */
const searchReportCards = async(req, res, next) => {
    try {
        const reportCards =
            await reportCardService.searchReportCards(
                req.query.keyword || ""
            );

        return ApiResponse.success(
            res,
            "Report cards retrieved successfully.",
            reportCards
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create report card
 */
const createReportCard = async(req, res, next) => {
    try {
        const reportCard =
            await reportCardService.createReportCard(
                req.body
            );

        return ApiResponse.created(
            res,
            "Report card created successfully.",
            reportCard
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update report card
 */
const updateReportCard = async(req, res, next) => {
    try {
        const reportCard =
            await reportCardService.updateReportCard(
                Number(req.params.id),
                req.body
            );

        return ApiResponse.success(
            res,
            "Report card updated successfully.",
            reportCard
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete report card
 */
const deleteReportCard = async(req, res, next) => {
    try {
        await reportCardService.deleteReportCard(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Report card deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getReportCards,
    getReportCardById,
    searchReportCards,
    createReportCard,
    updateReportCard,
    deleteReportCard,
};