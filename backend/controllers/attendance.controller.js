const attendanceService = require("../services/attendance.service");

exports.getAttendance = async(req, res) => {
    const attendance = await attendanceService.getAttendance();

    res.json({
        success: true,
        message: "Attendance records retrieved successfully.",
        data: attendance,
    });
};