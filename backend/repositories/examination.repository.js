const db = require("../database/db");

exports.findAllExaminations = async() => {
    return await db.examination.findMany({
        include: {
            results: true,
        },
        orderBy: {
            examDate: "desc",
        },
    });
};

exports.findExaminationById = async(id) => {
    return await db.examination.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            results: true,
        },
    });
};

exports.createExamination = async(examData) => {
    return await db.examination.create({
        data: examData,
        include: {
            results: true,
        },
    });
};

exports.updateExamination = async(id, examData) => {
    return await db.examination.update({
        where: {
            id: Number(id),
        },
        data: examData,
        include: {
            results: true,
        },
    });
};

exports.deleteExamination = async(id) => {
    return await db.examination.delete({
        where: {
            id: Number(id),
        },
    });
};