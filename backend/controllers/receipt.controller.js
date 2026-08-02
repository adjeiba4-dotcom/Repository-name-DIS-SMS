// controllers/receipt.controller.js

const receiptService = require("../services/receipt.service");
const ApiResponse = require("../utils/response");

/**
 * Get all receipts
 */
const getReceipts = async(req, res, next) => {
    try {
        const receipts = await receiptService.getReceipts();

        return ApiResponse.success(
            res,
            "Receipts retrieved successfully.",
            receipts
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get receipt by ID
 */
const getReceiptById = async(req, res, next) => {
    try {
        const receipt = await receiptService.getReceiptById(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Receipt retrieved successfully.",
            receipt
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search receipts
 */
const searchReceipts = async(req, res, next) => {
    try {
        const receipts = await receiptService.searchReceipts(
            req.query.keyword || ""
        );

        return ApiResponse.success(
            res,
            "Receipts retrieved successfully.",
            receipts
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create receipt
 */
const createReceipt = async(req, res, next) => {
    try {
        const receipt = await receiptService.createReceipt(
            req.body
        );

        return ApiResponse.created(
            res,
            "Receipt created successfully.",
            receipt
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update receipt
 */
const updateReceipt = async(req, res, next) => {
    try {
        const receipt = await receiptService.updateReceipt(
            Number(req.params.id),
            req.body
        );

        return ApiResponse.success(
            res,
            "Receipt updated successfully.",
            receipt
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete receipt
 */
const deleteReceipt = async(req, res, next) => {
    try {
        await receiptService.deleteReceipt(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Receipt deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getReceipts,
    getReceiptById,
    searchReceipts,
    createReceipt,
    updateReceipt,
    deleteReceipt,
};