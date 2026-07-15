const paymentService = require("../services/payment.service");

exports.getPayments = async(req, res) => {
    const payments = await paymentService.getPayments();

    res.json({
        success: true,
        message: "Payments retrieved successfully.",
        data: payments,
    });
};