const db = require("../database/db");

exports.findAllEnrollments = async() => {
    return await db.enrollment.findMany({
        include: {
            student: true,
            class: true,
            academicYear: true,
        },
        orderBy: {
            enrollmentDate: "desc",
        },
    });
};

exports.findEnrollmentById = async(id) => {
    return await db.enrollment.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            student: true,
            class: true,
            academicYear: true,
        },
    });
};

exports.createEnrollment = async(enrollmentData) => {
    return await db.enrollment.create({
        data: enrollmentData,
        include: {
            student: true,
            class: true,
            academicYear: true,
        },
    });
};

exports.updateEnrollment = async(id, enrollmentData) => {
    return await db.enrollment.update({
        where: {
            id: Number(id),
        },
        data: enrollmentData,
        include: {
            student: true,
            class: true,
            academicYear: true,
        },
    });
};

exports.deleteEnrollment = async(id) => {
    return await db.enrollment.delete({
        where: {
            id: Number(id),
        },
    });
};