const db = require("../database/db");

exports.createAttendance = async (attendanceData) => {
  return await db.attendance.create({
    data: attendanceData,
    include: {
      student: true,
      class: true,
      academicYear: true,
      term: true,
    },
  });
};