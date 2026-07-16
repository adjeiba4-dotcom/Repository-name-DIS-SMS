const db = require("../database/db");

exports.findAllSubjects = async() => {
    return await db.subject.findMany({
        include: {
            department: true,
            teacher: true,
        },
        orderBy: {
            subjectName: "asc",
        },
    });
};

exports.findSubjectById = async(id) => {
    return await db.subject.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            department: true,
            teacher: true,
        },
    });
};

exports.findSubjectByCode = async(subjectCode) => {
    return await db.subject.findUnique({
        where: {
            subjectCode,
        },
    });
};

exports.createSubject = async(subjectData) => {
    return await db.subject.create({
        data: subjectData,
        include: {
            department: true,
            teacher: true,
        },
    });
};

exports.updateSubject = async(id, subjectData) => {
    return await db.subject.update({
        where: {
            id: Number(id),
        },
        data: subjectData,
        include: {
            department: true,
            teacher: true,
        },
    });
};

exports.deleteSubject = async(id) => {
    return await db.subject.delete({
        where: {
            id: Number(id),
        },
    });
};