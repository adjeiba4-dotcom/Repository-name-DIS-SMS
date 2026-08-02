// repositories/feeType.repository.js

const db = require("../database/db");

const findAllFeeTypes = async() => {
    return await db.feeType.findMany({
        include: {
            feeStructures: true,
        },
        orderBy: {
            name: "asc",
        },
    });
};

const findFeeTypeById = async(id) => {
    return await db.feeType.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            feeStructures: true,
        },
    });
};

const findFeeTypeByCode = async(code) => {
    return await db.feeType.findUnique({
        where: {
            code,
        },
    });
};

const findFeeTypeByName = async(name) => {
    return await db.feeType.findFirst({
        where: {
            name,
        },
    });
};

const searchFeeTypes = async(keyword) => {
    return await db.feeType.findMany({
        where: {
            OR: [{
                    code: {
                        contains: keyword,
                    },
                },
                {
                    name: {
                        contains: keyword,
                    },
                },
                {
                    description: {
                        contains: keyword,
                    },
                },
            ],
        },
        include: {
            feeStructures: true,
        },
        orderBy: {
            name: "asc",
        },
    });
};

const createFeeType = async(data) => {
    return await db.feeType.create({
        data,
        include: {
            feeStructures: true,
        },
    });
};

const updateFeeType = async(id, data) => {
    return await db.feeType.update({
        where: {
            id: Number(id),
        },
        data,
        include: {
            feeStructures: true,
        },
    });
};

const deleteFeeType = async(id) => {
    return await db.feeType.delete({
        where: {
            id: Number(id),
        },
    });
};

module.exports = {
    findAllFeeTypes,
    findFeeTypeById,
    findFeeTypeByCode,
    findFeeTypeByName,
    searchFeeTypes,
    createFeeType,
    updateFeeType,
    deleteFeeType,
};