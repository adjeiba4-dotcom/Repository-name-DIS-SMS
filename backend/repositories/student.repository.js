const db = require("../database/db");

exports.findAllStudents = async() => {
    return await db.student.findMany({
        orderBy: {
            firstName: "asc",
        },
    });
};

exports.findStudentById = async(id) => {
    return await db.student.findUnique({
        where: {
            id: Number(id),
        },
    });
};

exports.findStudentByAdmissionNo = async(admissionNo) => {
    return await db.student.findUnique({
        where: {
            admissionNo,
        },
    });
};

exports.createStudent = async(studentData) => {
    return await db.student.create({
        data: studentData,
    });
};

exports.updateStudent = async(id, studentData) => {
    return await db.student.update({
        where: {
            id: Number(id),
        },
        data: studentData,
    });
};

exports.deleteStudent = async(id) => {
    return await db.student.delete({
        where: {
            id: Number(id),
        },
    });
};