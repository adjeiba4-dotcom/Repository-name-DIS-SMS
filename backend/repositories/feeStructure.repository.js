// repositories/feeStructure.repository.js

const db = require("../database/db");

const findAllFeeStructures = async() => {
    return await db.feeStructure.findMany({
        include: {
            academicYear: true,
            schoolClass: true,
            feeType: true,
            invoices: true,
        },
        orderBy: [{
                academicYear: {
                    name: "desc",
                },
            },
            {
                schoolClass: {
                    name: "asc",
                },
            },
            {
                feeType: {
                    name: "asc",
                },
            },
        ],
    });
};

const findFeeStructureById = async(id) => {
    return await db.feeStructure.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            academicYear: true,
            schoolClass: true,
            feeType: true,
            invoices: true,
        },
    });
};

const findFeeStructure = async(
    academicYearId,
    classId,
    feeTypeId
) => {
    return await db.feeStructure.findFirst({
        where: {
            academicYearId,
            classId,
            feeTypeId,
        },
    });
};

const findAcademicYearById = async(id) => {
    return await db.academicYear.findUnique({
        where: {
            id: Number(id),
        },
    });
};

const findSchoolClassById = async(id) => {
    return await db.schoolClass.findUnique({
        where: {
            id: Number(id),
        },
    });
};

const findFeeTypeById = async(id) => {
    return await db.feeType.findUnique({
        where: {
            id: Number(id),
        },
    });
};

const searchFeeStructures = async(keyword) => {
    return await db.feeStructure.findMany({
        where: {
            OR: [{
                    academicYear: {
                        name: {
                            contains: keyword,
                        },
                    },
                },
                {
                    schoolClass: {
                        name: {
                            contains: keyword,
                        },
                    },
                },
                {
                    feeType: {
                        name: {
                            contains: keyword,
                        },
                    },
                },
            ],
        },
        include: {
            academicYear: true,
            schoolClass: true,
            feeType: true,
            invoices: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const createFeeStructure = async(data) => {
    return await db.feeStructure.create({
        data,
        include: {
            academicYear: true,
            schoolClass: true,
            feeType: true,
            invoices: true,
        },
    });
};

const updateFeeStructure = async(id, data) => {
    return await db.feeStructure.update({
        where: {
            id: Number(id),
        },
        data,
        include: {
            academicYear: true,
            schoolClass: true,
            feeType: true,
            invoices: true,
        },
    });
};

const deleteFeeStructure = async(id) => {
    return await db.feeStructure.delete({
        where: {
            id: Number(id),
        },
    });
};

module.exports = {
    findAllFeeStructures,
    findFeeStructureById,
    findFeeStructure,
    findAcademicYearById,
    findSchoolClassById,
    findFeeTypeById,
    searchFeeStructures,
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
};