const db = require("../database/db");

exports.findAllFees = async() => {
    return await db.fee.findMany({
        include: {
            class: true,
            payments: true,
        },
        orderBy: {
            feeName: "asc",
        },
    });
};

exports.findFeeById = async(id) => {
    return await db.fee.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            class: true,
            payments: true,
        },
    });
};

exports.findFeeByName = async(feeName) => {
    return await db.fee.findFirst({
        where: {
            feeName,
        },
    });
};

exports.createFee = async(feeData) => {
    return await db.fee.create({
        data: feeData,
        include: {
            class: true,
            payments: true,
        },
    });
};

exports.updateFee = async(id, feeData) => {
    return await db.fee.update({
        where: {
            id: Number(id),
        },
        data: feeData,
        include: {
            class: true,
            payments: true,
        },
    });
};

exports.deleteFee = async(id) => {
    return await db.fee.delete({
        where: {
            id: Number(id),
        },
    });
};