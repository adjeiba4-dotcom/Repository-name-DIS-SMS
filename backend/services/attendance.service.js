const attendanceRepository = require("../repositories/attendance.repository");

exports.getAttendance = async() => {
    return await attendanceRepository.findAllAttendance();
};