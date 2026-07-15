const paymentService = require("../services/payment.create.service");

exports.createPayment = async(req, res) => {
    const payment = await paymentService.createPayment(req.body);

    res.status(201).json({
        success: true,
        message: "Payment recorded successfully.",
        data: payment,
    });
};