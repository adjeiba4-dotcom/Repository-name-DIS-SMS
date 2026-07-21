const db = require("../database/db");

exports.findAllTeachers = async(search = "") => {
    return await db.teacher.findMany({
        where: search ?
            {
                OR: [{
                        staffNo: {
                            contains: search,
                        },
                    },
                    {
                        firstName: {
                            contains: search,
                        },
                    },
                    {
                        lastName: {
                            contains: search,
                        },
                    },
                    {
                        email: {
                            contains: search,
                        },
                    },
                ],
            } :
            {},
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

exports.deleteTeacher = async(id) => {
    return await db.teacher.delete({
        where: {
            id: Number(id),
        },
    });
};