const paymentRepository = require("../repositories/payment.create.repository");

exports.createPayment = async(paymentData) => {
    return await paymentRepository.createPayment(paymentData);
};