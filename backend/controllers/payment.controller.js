// controllers/payment.controller.js

const paymentService = require("../services/payment.service");
const ApiResponse = require("../utils/response");

const getPayments = async(req, res, next) => {
    try {
        const payments = await paymentService.getPayments();

        return ApiResponse.success(
            res,
            "Payments retrieved successfully.",
            payments
        );
    } catch (error) {
        next(error);
    }
};

const getPaymentById = async(req, res, next) => {
    try {
        const payment = await paymentService.getPaymentById(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Payment retrieved successfully.",
            payment
        );
    } catch (error) {
        next(error);
    }
};

const searchPayments = async(req, res, next) => {
    try {
        const payments = await paymentService.searchPayments(
            req.query.keyword
        );

        return ApiResponse.success(
            res,
            "Payments retrieved successfully.",
            payments
        );
    } catch (error) {
        next(error);
    }
};

const createPayment = async(req, res, next) => {
    try {
        const payment = await paymentService.createPayment(req.body);

        return ApiResponse.created(
            res,
            "Payment created successfully.",
            payment
        );
    } catch (error) {
        next(error);
    }
};

const updatePayment = async(req, res, next) => {
    try {
        const payment = await paymentService.updatePayment(
            Number(req.params.id),
            req.body
        );

        return ApiResponse.success(
            res,
            "Payment updated successfully.",
            payment
        );
    } catch (error) {
        next(error);
    }
};

const deletePayment = async(req, res, next) => {
    try {
        await paymentService.deletePayment(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Payment deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPayments,
    getPaymentById,
    searchPayments,
    createPayment,
    updatePayment,
    deletePayment,
};