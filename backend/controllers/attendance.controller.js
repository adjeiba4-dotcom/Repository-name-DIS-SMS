// controllers/attendance.controller.js

const attendanceService = require("../services/attendance.service");
const ApiResponse = require("../utils/response");

exports.getAttendance = async (req, res, next) => {
    try {
        const result = await attendanceService.getAttendance(req.query);

        return ApiResponse.paginated(
            res,
            "Attendance records retrieved successfully.",
            result.data,
            {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            }
        );
    } catch (error) {
        next(error);
    }
};

exports.getRoster = async (req, res, next) => {
    try {
        const roster = await attendanceService.getRoster(req.query);

        return ApiResponse.success(
            res,
            "Attendance roster retrieved successfully.",
            roster
        );
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const stats = await attendanceService.getStats(req.query);

        return ApiResponse.success(
            res,
            "Attendance statistics retrieved successfully.",
            stats
        );
    } catch (error) {
        next(error);
    }
};

exports.getAttendanceById = async (req, res, next) => {
    try {
        const attendance = await attendanceService.getAttendanceById(
            parseInt(req.params.id, 10)
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

exports.createAttendance = async (req, res, next) => {
    try {
        const attendance = await attendanceService.createAttendance(req.body);

        return ApiResponse.created(
            res,
            "Attendance recorded successfully.",
            attendance
        );
    } catch (error) {
        next(error);
    }
};

exports.bulkAttendance = async (req, res, next) => {
    try {
        const result = await attendanceService.bulkAttendance(req.body);

        return ApiResponse.success(
            res,
            "Bulk attendance processed successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};

exports.updateAttendance = async (req, res, next) => {
    try {
        const attendance = await attendanceService.updateAttendance(
            parseInt(req.params.id, 10),
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

exports.deleteAttendance = async (req, res, next) => {
    try {
        await attendanceService.deleteAttendance(parseInt(req.params.id, 10));

        return ApiResponse.success(
            res,
            "Attendance deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};
