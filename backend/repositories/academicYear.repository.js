const db = require("../database/db");

exports.findAllAcademicYears = async() => {
    return await db.academicYear.findMany({
        orderBy: {
            yearName: "asc",
        },
    });
};

exports.createAcademicYear = async(academicYearData) => {
    return await db.academicYear.create({
        data: academicYearData,
    });
};