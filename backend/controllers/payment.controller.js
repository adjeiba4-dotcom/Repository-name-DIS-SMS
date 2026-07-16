const paymentService = require("../services/payment.service");

exports.getPayments = async(req, res, next) => {
    try {
        const payments = await paymentService.getPayments();

        res.status(200).json({
            success: true,
            message: "Payments retrieved successfully.",
            data: payments,
        });
    } catch (error) {
        next(error);
    }
};

exports.getPaymentById = async(req, res, next) => {
    try {
        const payment = await paymentService.getPaymentById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Payment retrieved successfully.",
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};

exports.createPayment = async(req, res, next) => {
    try {
        const payment = await paymentService.createPayment(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Payment created successfully.",
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};

exports.updatePayment = async(req, res, next) => {
    try {
        const payment = await paymentService.updatePayment(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Payment updated successfully.",
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};

exports.deletePayment = async(req, res, next) => {
    try {
        const result = await paymentService.deletePayment(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Payment deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};