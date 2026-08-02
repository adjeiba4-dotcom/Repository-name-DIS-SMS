// controllers/feeType.controller.js

const feeTypeService = require("../services/feeType.service");
const ApiResponse = require("../utils/response");

exports.getFeeTypes = async(req, res, next) => {
    try {
        const feeTypes = await feeTypeService.getFeeTypes();

        return ApiResponse.success(
            res,
            "Fee types retrieved successfully.",
            feeTypes
        );
    } catch (error) {
        next(error);
    }
};

exports.getFeeTypeById = async(req, res, next) => {
    try {
        const feeType =
            await feeTypeService.getFeeTypeById(
                req.params.id
            );

        return ApiResponse.success(
            res,
            "Fee type retrieved successfully.",
            feeType
        );
    } catch (error) {
        next(error);
    }
};

exports.searchFeeTypes = async(req, res, next) => {
    try {
        const keyword = req.query.keyword || "";

        const feeTypes =
            await feeTypeService.searchFeeTypes(
                keyword
            );

        return ApiResponse.success(
            res,
            "Fee type search completed successfully.",
            feeTypes
        );
    } catch (error) {
        next(error);
    }
};

exports.createFeeType = async(req, res, next) => {
    try {
        const feeType =
            await feeTypeService.createFeeType(
                req.body
            );

        return ApiResponse.created(
            res,
            "Fee type created successfully.",
            feeType
        );
    } catch (error) {
        next(error);
    }
};

exports.updateFeeType = async(req, res, next) => {
    try {
        const feeType =
            await feeTypeService.updateFeeType(
                req.params.id,
                req.body
            );

        return ApiResponse.success(
            res,
            "Fee type updated successfully.",
            feeType
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteFeeType = async(req, res, next) => {
    try {
        await feeTypeService.deleteFeeType(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Fee type deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};