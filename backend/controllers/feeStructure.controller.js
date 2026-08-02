// controllers/feeStructure.controller.js

const feeStructureService = require("../services/feeStructure.service");
const ApiResponse = require("../utils/response");

exports.getFeeStructures = async(req, res, next) => {
    try {
        const feeStructures =
            await feeStructureService.getFeeStructures();

        return ApiResponse.success(
            res,
            "Fee structures retrieved successfully.",
            feeStructures
        );
    } catch (error) {
        next(error);
    }
};

exports.getFeeStructureById = async(req, res, next) => {
    try {
        const feeStructure =
            await feeStructureService.getFeeStructureById(
                req.params.id
            );

        return ApiResponse.success(
            res,
            "Fee structure retrieved successfully.",
            feeStructure
        );
    } catch (error) {
        next(error);
    }
};

exports.searchFeeStructures = async(req, res, next) => {
    try {
        const keyword = req.query.keyword || "";

        const feeStructures =
            await feeStructureService.searchFeeStructures(
                keyword
            );

        return ApiResponse.success(
            res,
            "Fee structure search completed successfully.",
            feeStructures
        );
    } catch (error) {
        next(error);
    }
};

exports.createFeeStructure = async(req, res, next) => {
    try {
        const feeStructure =
            await feeStructureService.createFeeStructure(
                req.body
            );

        return ApiResponse.created(
            res,
            "Fee structure created successfully.",
            feeStructure
        );
    } catch (error) {
        next(error);
    }
};

exports.updateFeeStructure = async(req, res, next) => {
    try {
        const feeStructure =
            await feeStructureService.updateFeeStructure(
                req.params.id,
                req.body
            );

        return ApiResponse.success(
            res,
            "Fee structure updated successfully.",
            feeStructure
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteFeeStructure = async(req, res, next) => {
    try {
        await feeStructureService.deleteFeeStructure(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Fee structure deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};