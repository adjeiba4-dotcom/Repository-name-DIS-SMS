const db = require("../database/db");

exports.findAllTeachers = async() => {
    return await db.teacher.findMany({
        orderBy: {
            firstName: "asc",
        },
    });
};

exports.findTeacherById = async(id) => {
    return await db.teacher.findUnique({
        where: {
            id: Number(id),
        },
    });
};

exports.findTeacherByEmail = async(email) => {
    return await db.teacher.findUnique({
        where: {
            email,
        },
    });
};

exports.createTeacher = async(teacherData) => {
    return await db.teacher.create({
        data: teacherData,
    });
};

exports.updateTeacher = async(id, teacherData) => {
    return await db.teacher.update({
        where: {
            id: Number(id),
        },
        data: teacherData,
    });
};