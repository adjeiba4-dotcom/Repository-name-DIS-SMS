const db = require("../database/db");

exports.findAllFees = async() => {
    return await db.fee.findMany({
        include: {
            academicYear: true,
            term: true,
            class: true,
        },
        orderBy: {
            id: "desc",
        },
    });
};