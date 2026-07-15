const paymentRepository = require("../repositories/payment.repository");

exports.getPayments = async() => {
    return await paymentRepository.findAllPayments();
};