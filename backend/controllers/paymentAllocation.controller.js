const paymentAllocationService = require("../services/paymentAllocation.service");
const ApiResponse = require("../utils/response");

/**
 * Get all payment allocations
 */
const getPaymentAllocations = async(req, res, next) => {
    try {
        const allocations =
            await paymentAllocationService.getPaymentAllocations();

        return ApiResponse.success(
            res,
            "Payment allocations retrieved successfully.",
            allocations
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment allocation by ID
 */
const getPaymentAllocationById = async(req, res, next) => {
    try {
        const allocation =
            await paymentAllocationService.getPaymentAllocationById(
                Number(req.params.id)
            );

        return ApiResponse.success(
            res,
            "Payment allocation retrieved successfully.",
            allocation
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search payment allocations
 */
const searchPaymentAllocations = async(req, res, next) => {
    try {
        const allocations =
            await paymentAllocationService.searchPaymentAllocations(
                req.query.keyword || ""
            );

        return ApiResponse.success(
            res,
            "Payment allocations retrieved successfully.",
            allocations
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create payment allocation
 */
const createPaymentAllocation = async(req, res, next) => {
    try {
        const allocation =
            await paymentAllocationService.createPaymentAllocation(
                req.body
            );

        return ApiResponse.created(
            res,
            "Payment allocation created successfully.",
            allocation
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update payment allocation
 */
const updatePaymentAllocation = async(req, res, next) => {
    try {
        const allocation =
            await paymentAllocationService.updatePaymentAllocation(
                Number(req.params.id),
                req.body
            );

        return ApiResponse.success(
            res,
            "Payment allocation updated successfully.",
            allocation
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete payment allocation
 */
const deletePaymentAllocation = async(req, res, next) => {
    try {
        await paymentAllocationService.deletePaymentAllocation(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Payment allocation deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPaymentAllocations,
    getPaymentAllocationById,
    searchPaymentAllocations,
    createPaymentAllocation,
    updatePaymentAllocation,
    deletePaymentAllocation,
};