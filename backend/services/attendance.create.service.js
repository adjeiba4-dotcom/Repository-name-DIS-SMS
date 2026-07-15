const attendanceRepository = require("../repositories/attendance.create.repository");

exports.createAttendance = async(attendanceData) => {
    return await attendanceRepository.createAttendance(attendanceData);
};