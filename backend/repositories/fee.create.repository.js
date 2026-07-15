const db = require("../database/db");

exports.createFee = async(feeData) => {
    return await db.fee.create({
        data: feeData,
        include: {
            academicYear: true,
            term: true,
            class: true,
        },
    });
};