const attendanceService = require("../services/attendance.create.service");

exports.createAttendance = async(req, res) => {
    const attendance = await attendanceService.createAttendance(req.body);

    res.status(201).json({
        success: true,
        message: "Attendance recorded successfully.",
        data: attendance,
    });
};