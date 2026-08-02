// controllers/timetable.controller.js

const timetableService = require("../services/timetable.service");
const ApiResponse = require("../utils/response");

/**
 * Get all timetable entries
 */
const getTimetables = async(req, res, next) => {
    try {
        const timetables =
            await timetableService.getTimetables();

        return ApiResponse.success(
            res,
            "Timetable entries retrieved successfully.",
            timetables
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get timetable by ID
 */
const getTimetableById = async(req, res, next) => {
    try {
        const timetable =
            await timetableService.getTimetableById(
                Number(req.params.id)
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

/**
 * Search timetable
 */
const searchTimetables = async(req, res, next) => {
    try {
        const timetables =
            await timetableService.searchTimetables(
                req.query.keyword || ""
            );

        return ApiResponse.success(
            res,
            "Timetable entries retrieved successfully.",
            timetables
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create timetable
 */
const createTimetable = async(req, res, next) => {
    try {
        const timetable =
            await timetableService.createTimetable(
                req.body
            );

        return ApiResponse.created(
            res,
            "Timetable created successfully.",
            timetable
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update timetable
 */
const updateTimetable = async(req, res, next) => {
    try {
        const timetable =
            await timetableService.updateTimetable(
                Number(req.params.id),
                req.body
            );

        return ApiResponse.success(
            res,
            "Timetable updated successfully.",
            timetable
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete timetable
 */
const deleteTimetable = async(req, res, next) => {
    try {
        await timetableService.deleteTimetable(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Timetable deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTimetables,
    getTimetableById,
    searchTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable,
};