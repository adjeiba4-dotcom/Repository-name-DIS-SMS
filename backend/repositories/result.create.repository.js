const db = require("../database/db");

exports.createResult = async(resultData) => {
    return await db.result.create({
        data: resultData,
        include: {
            student: true,
            examination: true,
            subject: true,
            class: true,
            academicYear: true,
            term: true,
        },
    });
};