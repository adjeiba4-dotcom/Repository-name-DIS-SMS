const paymentRepository = require("../repositories/payment.repository");

exports.getPayments = async() => {
    return await paymentRepository.findAllPayments();
};

exports.getPaymentById = async(id) => {
    const payment = await paymentRepository.findPaymentById(id);

    if (!payment) {
        throw new Error("Payment not found.");
    }

    return payment;
};

exports.createPayment = async(paymentData) => {
    if (paymentData.referenceNo) {
        const existingPayment =
            await paymentRepository.findPaymentByReferenceNo(
                paymentData.referenceNo
            );

        if (existingPayment) {
            throw new Error("Reference number already exists.");
        }
    }

    return await paymentRepository.createPayment(paymentData);
};

exports.updatePayment = async(id, paymentData) => {
    const existingPayment =
        await paymentRepository.findPaymentById(id);

    if (!existingPayment) {
        throw new Error("Payment not found.");
    }

    if (
        paymentData.referenceNo &&
        paymentData.referenceNo !== existingPayment.referenceNo
    ) {
        const duplicate =
            await paymentRepository.findPaymentByReferenceNo(
                paymentData.referenceNo
            );

        if (duplicate) {
            throw new Error("Reference number already exists.");
        }
    }

    return await paymentRepository.updatePayment(
        id,
        paymentData
    );
};

exports.deletePayment = async(id) => {
    const existingPayment =
        await paymentRepository.findPaymentById(id);

    if (!existingPayment) {
        throw new Error("Payment not found.");
    }

    await paymentRepository.deletePayment(id);

    return {
        id: Number(id),
    };
};