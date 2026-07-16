const db = require("../database/db");

exports.findAllAcademicYears = async() => {
    return await db.academicYear.findMany({
        include: {
            terms: true,
            enrollments: true,
        },
        orderBy: {
            startDate: "desc",
        },
    });
};

exports.findAcademicYearById = async(id) => {
    return await db.academicYear.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            terms: true,
            enrollments: true,
        },
    });
};

exports.findAcademicYearByName = async(yearName) => {
    return await db.academicYear.findUnique({
        where: {
            yearName,
        },
    });
};

exports.createAcademicYear = async(academicYearData) => {
    return await db.academicYear.create({
        data: academicYearData,
        include: {
            terms: true,
            enrollments: true,
        },
    });
};

exports.updateAcademicYear = async(id, academicYearData) => {
    return await db.academicYear.update({
        where: {
            id: Number(id),
        },
        data: academicYearData,
        include: {
            terms: true,
            enrollments: true,
        },
    });
};

exports.deleteAcademicYear = async(id) => {
    return await db.academicYear.delete({
        where: {
            id: Number(id),
        },
    });
};