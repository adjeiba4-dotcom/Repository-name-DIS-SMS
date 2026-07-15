const db = require("../database/db");

exports.findAllAttendance = async() => {
    return await db.attendance.findMany({
        include: {
            student: true,
            class: true,
            academicYear: true,
            term: true,
        },
        orderBy: {
            attendanceDate: "desc",
        },
    });
};