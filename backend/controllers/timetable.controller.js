// controllers/timetable.controller.js

const timetableService = require("../services/timetable.service");
const ApiResponse = require("../utils/response");

exports.getTimetables = async (req, res, next) => {
    try {
        const result = await timetableService.getTimetables(req.query);

        return ApiResponse.paginated(
            res,
            "Timetable entries retrieved successfully.",
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

exports.getTimetableView = async (req, res, next) => {
    try {
        const view = await timetableService.getTimetableView(req.query);

        return ApiResponse.success(
            res,
            "Timetable view retrieved successfully.",
            view
        );
    } catch (error) {
        next(error);
    }
};

exports.getTimetableById = async (req, res, next) => {
    try {
        const timetable = await timetableService.getTimetableById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Timetable entry retrieved successfully.",
            timetable
        );
    } catch (error) {
        next(error);
    }
};

exports.createTimetable = async (req, res, next) => {
    try {
        const timetable = await timetableService.createTimetable(req.body);

        return ApiResponse.created(
            res,
            "Timetable entry created successfully.",
            timetable
        );
    } catch (error) {
        next(error);
    }
};

exports.updateTimetable = async (req, res, next) => {
    try {
        const timetable = await timetableService.updateTimetable(
            parseInt(req.params.id, 10),
            req.body
        );

        return ApiResponse.success(
            res,
            "Timetable entry updated successfully.",
            timetable
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteTimetable = async (req, res, next) => {
    try {
        await timetableService.deleteTimetable(parseInt(req.params.id, 10));

        return ApiResponse.success(
            res,
            "Timetable entry deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};
