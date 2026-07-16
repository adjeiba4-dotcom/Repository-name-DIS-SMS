const db = require("../database/db");

exports.findAllPayments = async() => {
    return await db.payment.findMany({
        include: {
            student: true,
            fee: true,
        },
        orderBy: {
            paymentDate: "desc",
        },
    });
};

exports.findPaymentById = async(id) => {
    return await db.payment.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            student: true,
            fee: true,
        },
    });
};

exports.findPaymentByReferenceNo = async(referenceNo) => {
    return await db.payment.findFirst({
        where: {
            referenceNo,
        },
    });
};

exports.createPayment = async(paymentData) => {
    return await db.payment.create({
        data: paymentData,
        include: {
            student: true,
            fee: true,
        },
    });
};

exports.updatePayment = async(id, paymentData) => {
    return await db.payment.update({
        where: {
            id: Number(id),
        },
        data: paymentData,
        include: {
            student: true,
            fee: true,
        },
    });
};

exports.deletePayment = async(id) => {
    return await db.payment.delete({
        where: {
            id: Number(id),
        },
    });
};