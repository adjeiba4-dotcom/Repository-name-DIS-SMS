const attendanceService = require("../services/attendance.service");

exports.getAttendance = async(req, res, next) => {
    try {
        const attendance = await attendanceService.getAttendance();

        res.status(200).json({
            success: true,
            message: "Attendance records retrieved successfully.",
            data: attendance,
        });
    } catch (error) {
        next(error);
    }
};

exports.getAttendanceById = async(req, res, next) => {
    try {
        const attendance = await attendanceService.getAttendanceById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Attendance record retrieved successfully.",
            data: attendance,
        });
    } catch (error) {
        next(error);
    }
};

exports.createAttendance = async(req, res, next) => {
    try {
        const attendance = await attendanceService.createAttendance(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Attendance recorded successfully.",
            data: attendance,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAttendance = async(req, res, next) => {
    try {
        const attendance = await attendanceService.updateAttendance(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Attendance updated successfully.",
            data: attendance,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteAttendance = async(req, res, next) => {
    try {
        const result = await attendanceService.deleteAttendance(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Attendance deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};