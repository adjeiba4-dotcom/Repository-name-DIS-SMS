// controllers/studentPromotion.controller.js

const studentPromotionService = require("../services/studentPromotion.service");
const ApiResponse = require("../utils/response");

/**
 * Get all student promotions
 */
const getStudentPromotions = async(req, res, next) => {
    try {
        const promotions =
            await studentPromotionService.getStudentPromotions();

        return ApiResponse.success(
            res,
            "Student promotions retrieved successfully.",
            promotions
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get student promotion by ID
 */
const getStudentPromotionById = async(req, res, next) => {
    try {
        const promotion =
            await studentPromotionService.getStudentPromotionById(
                Number(req.params.id)
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

/**
 * Search student promotions
 */
const searchStudentPromotions = async(req, res, next) => {
    try {
        const promotions =
            await studentPromotionService.searchStudentPromotions(
                req.query.keyword || ""
            );

        return ApiResponse.success(
            res,
            "Student promotions retrieved successfully.",
            promotions
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create student promotion
 */
const createStudentPromotion = async(req, res, next) => {
    try {
        const promotion =
            await studentPromotionService.createStudentPromotion(
                req.body
            );

        return ApiResponse.created(
            res,
            "Student promoted successfully.",
            promotion
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update student promotion
 */
const updateStudentPromotion = async(req, res, next) => {
    try {
        const promotion =
            await studentPromotionService.updateStudentPromotion(
                Number(req.params.id),
                req.body
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

/**
 * Delete student promotion
 */
const deleteStudentPromotion = async(req, res, next) => {
    try {
        await studentPromotionService.deleteStudentPromotion(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Student promotion deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStudentPromotions,
    getStudentPromotionById,
    searchStudentPromotions,
    createStudentPromotion,
    updateStudentPromotion,
    deleteStudentPromotion,
};