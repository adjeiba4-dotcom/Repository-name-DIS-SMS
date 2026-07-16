const db = require("../database/db");

exports.findAllTerms = async() => {
    return await db.term.findMany({
        include: {
            academicYear: true,
        },
        orderBy: {
            startDate: "desc",
        },
    });
};

exports.findTermById = async(id) => {
    return await db.term.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            academicYear: true,
        },
    });
};

exports.createTerm = async(termData) => {
    return await db.term.create({
        data: termData,
        include: {
            academicYear: true,
        },
    });
};

exports.updateTerm = async(id, termData) => {
    return await db.term.update({
        where: {
            id: Number(id),
        },
        data: termData,
        include: {
            academicYear: true,
        },
    });
};

exports.deleteTerm = async(id) => {
    return await db.term.delete({
        where: {
            id: Number(id),
        },
    });
};