const db = require("../database/db");

const studentSelect = {
    id: true,
    admissionNo: true,
    firstName: true,
    lastName: true,
    otherName: true,
    gender: true,
    dateOfBirth: true,
    email: true,
    phone: true,
    address: true,
    admissionDate: true,
    guardianId: true,
    status: true,
    createdAt: true,
    updatedAt: true,

    guardian: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            relationship: true,
        },
    },
};

exports.findAllStudents = async() => {
    return await db.student.findMany({
        where: {
            deletedAt: null,
        },
        select: studentSelect,
        orderBy: {
            firstName: "asc",
        },
    });
};

exports.findStudentById = async(id) => {
    return await db.student.findFirst({
        where: {
            id: Number(id),
            deletedAt: null,
        },
        select: studentSelect,
    });
};

exports.findStudentByAdmissionNo = async(admissionNo) => {
    return await db.student.findFirst({
        where: {
            admissionNo,
            deletedAt: null,
        },
        select: studentSelect,
    });
};

exports.createStudent = async(studentData) => {
    return await db.student.create({
        data: studentData,
        select: studentSelect,
    });
};

exports.updateStudent = async(id, studentData) => {
    return await db.student.update({
        where: {
            id: Number(id),
        },
        data: studentData,
        select: studentSelect,
    });
};

exports.softDeleteStudent = async(id) => {
    return await db.student.update({
        where: {
            id: Number(id),
        },
        data: {
            status: "ARCHIVED",
            deletedAt: new Date(),
        },
    });
};