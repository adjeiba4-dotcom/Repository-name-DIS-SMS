// controllers/examination.controller.js

const examinationService = require("../services/examination.service");
const ApiResponse = require("../utils/response");

exports.getExaminations = async(req, res, next) => {
    try {
        const examinations =
            await examinationService.getExaminations();

        return ApiResponse.success(
            res,
            "Examinations retrieved successfully.",
            examinations
        );
    } catch (error) {
        next(error);
    }
};

exports.getExaminationById = async(req, res, next) => {
    try {
        const examination =
            await examinationService.getExaminationById(
                req.params.id
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

exports.searchExaminations = async(req, res, next) => {
    try {
        const { keyword } = req.query;

        const examinations =
            await examinationService.searchExaminations(
                keyword || ""
            );

        return ApiResponse.success(
            res,
            "Examination search completed successfully.",
            examinations
        );
    } catch (error) {
        next(error);
    }
};

exports.createExamination = async(req, res, next) => {
    try {
        const examination =
            await examinationService.createExamination(
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

exports.updateExamination = async(req, res, next) => {
    try {
        const examination =
            await examinationService.updateExamination(
                req.params.id,
                req.body
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

exports.deleteExamination = async(req, res, next) => {
    try {
        await examinationService.deleteExamination(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Examination deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};