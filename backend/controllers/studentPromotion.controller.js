// controllers/studentPromotion.controller.js

const studentPromotionService = require("../services/studentPromotion.service");
const ApiResponse = require("../utils/response");

exports.getPromotions = async (req, res, next) => {
    try {
        const result = await studentPromotionService.getPromotions(req.query);
        return ApiResponse.paginated(
            res,
            "Student promotions retrieved successfully.",
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

exports.getArchivedPromotions = async (req, res, next) => {
    try {
        const result = await studentPromotionService.getArchivedPromotions(
            req.query
        );
        return ApiResponse.paginated(
            res,
            "Archived student promotions retrieved successfully.",
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

exports.getGraduates = async (req, res, next) => {
    try {
        const result = await studentPromotionService.getGraduates(req.query);
        return ApiResponse.paginated(
            res,
            "Graduates retrieved successfully.",
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
        const stats = await studentPromotionService.getStats(req.query);
        return ApiResponse.success(
            res,
            "Promotion statistics retrieved successfully.",
            stats
        );
    } catch (error) {
        next(error);
    }
};

exports.getPromotionById = async (req, res, next) => {
    try {
        const promotion = await studentPromotionService.getPromotionById(
            parseInt(req.params.id, 10)
        );
        return ApiResponse.success(
            res,
            "Student promotion retrieved successfully.",
            promotion
        );
    } catch (error) {
        next(error);
    }
};

exports.getStudentHistory = async (req, res, next) => {
    try {
        const history = await studentPromotionService.getStudentHistory(
            parseInt(req.params.studentId, 10)
        );
        return ApiResponse.success(
            res,
            "Student promotion history retrieved successfully.",
            history
        );
    } catch (error) {
        next(error);
    }
};

exports.recommend = async (req, res, next) => {
    try {
        const result = await studentPromotionService.recommend(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Promotion recommendations generated successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.updatePromotion = async (req, res, next) => {
    try {
        const promotion = await studentPromotionService.updatePromotion(
            parseInt(req.params.id, 10),
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Student promotion updated successfully.",
            promotion
        );
    } catch (error) {
        next(error);
    }
};

exports.approve = async (req, res, next) => {
    try {
        const result = await studentPromotionService.approve(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Promotions approved successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.unapprove = async (req, res, next) => {
    try {
        const result = await studentPromotionService.unapprove(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Promotion approvals reversed successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.execute = async (req, res, next) => {
    try {
        const result = await studentPromotionService.execute(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Promotions executed successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        const result = await studentPromotionService.cancel(
            req.body,
            req.user
        );
        return ApiResponse.success(
            res,
            "Promotions cancelled successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.archivePromotion = async (req, res, next) => {
    try {
        await studentPromotionService.archivePromotion(
            parseInt(req.params.id, 10),
            req.user
        );
        return ApiResponse.success(
            res,
            "Student promotion archived successfully."
        );
    } catch (error) {
        next(error);
    }
};

exports.restorePromotion = async (req, res, next) => {
    try {
        const promotion = await studentPromotionService.restorePromotion(
            parseInt(req.params.id, 10)
        );
        return ApiResponse.success(
            res,
            "Student promotion restored successfully.",
            promotion
        );
    } catch (error) {
        next(error);
    }
};
