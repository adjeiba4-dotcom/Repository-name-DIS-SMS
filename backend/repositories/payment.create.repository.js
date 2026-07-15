const db = require("../database/db");

exports.createPayment = async(paymentData) => {
    return await db.payment.create({
        data: paymentData,
        include: {
            student: true,
            fee: true,
            academicYear: true,
            term: true,
        },
    });
};