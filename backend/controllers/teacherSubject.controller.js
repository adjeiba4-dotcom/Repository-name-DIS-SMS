// controllers/teacherSubject.controller.js

const teacherSubjectService = require("../services/teacherSubject.service");
const ApiResponse = require("../utils/response");

exports.getTeacherSubjects = async(req, res, next) => {
    try {
        const teacherSubjects =
            await teacherSubjectService.getTeacherSubjects();

        return ApiResponse.success(
            res,
            "Teacher subject assignments retrieved successfully.",
            teacherSubjects
        );
    } catch (error) {
        next(error);
    }
};

exports.getTeacherSubjectById = async(req, res, next) => {
    try {
        const teacherSubject =
            await teacherSubjectService.getTeacherSubjectById(
                parseInt(req.params.id)
            );

        return ApiResponse.success(
            res,
            "Teacher subject assignment retrieved successfully.",
            teacherSubject
        );
    } catch (error) {
        next(error);
    }
};

exports.searchTeacherSubjects = async(req, res, next) => {
    try {
        const { keyword = "" } = req.query;

        const teacherSubjects =
            await teacherSubjectService.searchTeacherSubjects(
                keyword
            );

        return ApiResponse.success(
            res,
            "Teacher subject assignments retrieved successfully.",
            teacherSubjects
        );
    } catch (error) {
        next(error);
    }
};

exports.createTeacherSubject = async(req, res, next) => {
    try {
        const teacherSubject =
            await teacherSubjectService.createTeacherSubject(
                req.body
            );

        return ApiResponse.created(
            res,
            "Teacher subject assigned successfully.",
            teacherSubject
        );
    } catch (error) {
        next(error);
    }
};

exports.updateTeacherSubject = async(req, res, next) => {
    try {
        const teacherSubject =
            await teacherSubjectService.updateTeacherSubject(
                parseInt(req.params.id),
                req.body
            );

        return ApiResponse.success(
            res,
            "Teacher subject assignment updated successfully.",
            teacherSubject
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteTeacherSubject = async(req, res, next) => {
    try {
        await teacherSubjectService.deleteTeacherSubject(
            parseInt(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Teacher subject assignment deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};