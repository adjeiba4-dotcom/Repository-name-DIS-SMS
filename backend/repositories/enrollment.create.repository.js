const db = require("../database/db");

exports.createEnrollment = async(enrollmentData) => {
    return await db.enrollment.create({
        data: enrollmentData,
        include: {
            student: true,
            class: true,
            academicYear: true,
            term: true,
        },
    });
};