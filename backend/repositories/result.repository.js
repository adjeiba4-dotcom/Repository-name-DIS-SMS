const db = require("../database/db");

exports.findAllResults = async() => {
    return await db.result.findMany({
        include: {
            student: true,
            subject: true,
            examination: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

exports.findResultById = async(id) => {
    return await db.result.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            student: true,
            subject: true,
            examination: true,
        },
    });
};

exports.createResult = async(resultData) => {
    return await db.result.create({
        data: resultData,
        include: {
            student: true,
            subject: true,
            examination: true,
        },
    });
};

exports.updateResult = async(id, resultData) => {
    return await db.result.update({
        where: {
            id: Number(id),
        },
        data: resultData,
        include: {
            student: true,
            subject: true,
            examination: true,
        },
    });
};

exports.deleteResult = async(id) => {
    return await db.result.delete({
        where: {
            id: Number(id),
        },
    });
};