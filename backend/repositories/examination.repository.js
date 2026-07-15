const db = require("../database/db");

exports.findAllExaminations = async() => {
    return await db.examination.findMany({
        include: {
            academicYear: true,
            term: true,
            class: true,
            subject: true,
        },
        orderBy: {
            examDate: "desc",
        },
    });
};