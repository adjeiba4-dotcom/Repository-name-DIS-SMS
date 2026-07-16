const db = require("../database/db");

exports.findAllAttendance = async() => {
    return await db.attendance.findMany({
        include: {
            student: true,
        },
        orderBy: {
            date: "desc",
        },
    });
};

exports.findAttendanceById = async(id) => {
    return await db.attendance.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            student: true,
        },
    });
};

exports.createAttendance = async(attendanceData) => {
    return await db.attendance.create({
        data: attendanceData,
        include: {
            student: true,
        },
    });
};

exports.updateAttendance = async(id, attendanceData) => {
    return await db.attendance.update({
        where: {
            id: Number(id),
        },
        data: attendanceData,
        include: {
            student: true,
        },
    });
};

exports.deleteAttendance = async(id) => {
    return await db.attendance.delete({
        where: {
            id: Number(id),
        },
    });
};