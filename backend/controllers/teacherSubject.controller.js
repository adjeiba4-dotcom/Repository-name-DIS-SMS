// controllers/teacherSubject.controller.js

const teacherSubjectService = require("../services/teacherSubject.service");
const ApiResponse = require("../utils/response");

exports.getTeacherSubjects = async (req, res, next) => {
    try {
        const result = await teacherSubjectService.getTeacherSubjects(
            req.query
        );

        return ApiResponse.paginated(
            res,
            "Teacher subject assignments retrieved successfully.",
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

exports.getTeacherSubjectById = async (req, res, next) => {
    try {
        const assignment = await teacherSubjectService.getTeacherSubjectById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Teacher subject assignment retrieved successfully.",
            assignment
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedTeacherSubjects = async (req, res, next) => {
    try {
        const assignments =
            await teacherSubjectService.getArchivedTeacherSubjects();

        return ApiResponse.success(
            res,
            "Archived teacher subject assignments retrieved successfully.",
            assignments
        );
    } catch (error) {
        next(error);
    }
};

exports.createTeacherSubject = async (req, res, next) => {
    try {
        const assignment = await teacherSubjectService.createTeacherSubject(
            req.body
        );

        return ApiResponse.created(
            res,
            "Teacher subject assignment created successfully.",
            assignment
        );
    } catch (error) {
        next(error);
    }
};

exports.updateTeacherSubject = async (req, res, next) => {
    try {
        const assignment = await teacherSubjectService.updateTeacherSubject(
            parseInt(req.params.id, 10),
            req.body
        );

        return ApiResponse.success(
            res,
            "Teacher subject assignment updated successfully.",
            assignment
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteTeacherSubject = async (req, res, next) => {
    try {
        const assignment = await teacherSubjectService.deleteTeacherSubject(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Teacher subject assignment archived successfully.",
            assignment
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreTeacherSubject = async (req, res, next) => {
    try {
        const activate =
            req.body?.activate === true || req.query?.activate === "true";

        const assignment = await teacherSubjectService.restoreTeacherSubject(
            parseInt(req.params.id, 10),
            { activate }
        );

        return ApiResponse.success(
            res,
            "Teacher subject assignment restored successfully.",
            assignment
        );
    } catch (error) {
        next(error);
    }
};
