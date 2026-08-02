// controllers/teacher.controller.js

const teacherService = require("../services/teacher.service");
const ApiResponse = require("../utils/response");

exports.getTeachers = async(req, res, next) => {
    try {
        const teachers = await teacherService.getTeachers();

        return ApiResponse.success(
            res,
            "Teachers retrieved successfully.",
            teachers
        );
    } catch (error) {
        next(error);
    }
};

exports.getTeacherById = async(req, res, next) => {
    try {
        const teacher = await teacherService.getTeacherById(
            parseInt(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Teacher retrieved successfully.",
            teacher
        );
    } catch (error) {
        next(error);
    }
};

exports.searchTeachers = async(req, res, next) => {
    try {
        const { keyword = "" } = req.query;

        const teachers = await teacherService.searchTeachers(keyword);

        return ApiResponse.success(
            res,
            "Teachers retrieved successfully.",
            teachers
        );
    } catch (error) {
        next(error);
    }
};

exports.createTeacher = async(req, res, next) => {
    try {
        const teacher = await teacherService.createTeacher(req.body);

        return ApiResponse.created(
            res,
            "Teacher created successfully.",
            teacher
        );
    } catch (error) {
        next(error);
    }
};

exports.updateTeacher = async(req, res, next) => {
    try {
        const teacher = await teacherService.updateTeacher(
            parseInt(req.params.id),
            req.body
        );

        return ApiResponse.success(
            res,
            "Teacher updated successfully.",
            teacher
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteTeacher = async(req, res, next) => {
    try {
        await teacherService.deleteTeacher(
            parseInt(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Teacher archived successfully."
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreTeacher = async(req, res, next) => {
    try {
        const teacher = await teacherService.restoreTeacher(
            parseInt(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Teacher restored successfully.",
            teacher
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedTeachers = async(req, res, next) => {
    try {
        const teachers = await teacherService.getArchivedTeachers();

        return ApiResponse.success(
            res,
            "Archived teachers retrieved successfully.",
            teachers
        );
    } catch (error) {
        next(error);
    }
};