const db = require("../database/db");

exports.findAllPayments = async() => {
    return await db.payment.findMany({
        include: {
            student: true,
            fee: true,
            academicYear: true,
            term: true,
        },
        orderBy: {
            paymentDate: "desc",
        },
    });
};