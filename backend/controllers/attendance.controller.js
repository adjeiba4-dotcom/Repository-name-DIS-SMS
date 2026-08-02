// controllers/attendance.controller.js

const attendanceService = require("../services/attendance.service");
const ApiResponse = require("../utils/response");

exports.getAttendance = async(req, res, next) => {
    try {
        const attendance =
            await attendanceService.getAttendance();

        return ApiResponse.success(
            res,
            "Attendance records retrieved successfully.",
            attendance
        );
    } catch (error) {
        next(error);
    }
};

exports.getAttendanceById = async(req, res, next) => {
    try {
        const attendance =
            await attendanceService.getAttendanceById(
                req.params.id
            );

        return ApiResponse.success(
            res,
            "Attendance record retrieved successfully.",
            attendance
        );
    } catch (error) {
        next(error);
    }
};

exports.searchAttendance = async(req, res, next) => {
    try {
        const { keyword } = req.query;

        const attendance =
            await attendanceService.searchAttendance(
                keyword || ""
            );

        return ApiResponse.success(
            res,
            "Attendance search completed successfully.",
            attendance
        );
    } catch (error) {
        next(error);
    }
};

exports.createAttendance = async(req, res, next) => {
    try {
        const attendance =
            await attendanceService.createAttendance(
                req.body
            );

        return ApiResponse.created(
            res,
            "Attendance recorded successfully.",
            attendance
        );
    } catch (error) {
        next(error);
    }
};

exports.updateAttendance = async(req, res, next) => {
    try {
        const attendance =
            await attendanceService.updateAttendance(
                req.params.id,
                req.body
            );

        return ApiResponse.success(
            res,
            "Attendance updated successfully.",
            attendance
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteAttendance = async(req, res, next) => {
    try {
        await attendanceService.deleteAttendance(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Attendance deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};