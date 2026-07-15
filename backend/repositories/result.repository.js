const db = require("../database/db");

exports.findAllResults = async() => {
    return await db.result.findMany({
        include: {
            student: true,
            examination: true,
            subject: true,
            class: true,
            academicYear: true,
            term: true,
        },
        orderBy: {
            id: "desc",
        },
    });
};