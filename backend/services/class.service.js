const db = require("../database/db");

exports.findAllClasses = async() => {
    return await db.class.findMany({
        orderBy: {
            className: "asc",
        },
    });
};

exports.findClassById = async(id) => {
    return await db.class.findUnique({
        where: {
            id: Number(id),
        },
    });
};

exports.findClassByCode = async(classCode) => {
    return await db.class.findUnique({
        where: {
            classCode,
        },
    });
};

exports.createClass = async(classData) => {
    return await db.class.create({
        data: classData,
    });
};

exports.updateClass = async(id, classData) => {
    return await db.class.update({
        where: {
            id: Number(id),
        },
        data: classData,
    });
};

exports.deleteClass = async(id) => {
    return await db.class.delete({
        where: {
            id: Number(id),
        },
    });
};