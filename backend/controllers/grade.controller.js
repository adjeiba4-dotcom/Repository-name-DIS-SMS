// controllers/grade.controller.js

const gradeService = require("../services/grade.service");
const ApiResponse = require("../utils/response");

exports.listScales = async (req, res, next) => {
    try {
        const scales = await gradeService.listScales(req.query);
        return ApiResponse.success(
            res,
            "Grade scales retrieved successfully.",
            scales
        );
    } catch (error) {
        next(error);
    }
};

exports.getScaleById = async (req, res, next) => {
    try {
        const scale = await gradeService.getScaleById(
            parseInt(req.params.id, 10)
        );
        return ApiResponse.success(
            res,
            "Grade scale retrieved successfully.",
            scale
        );
    } catch (error) {
        next(error);
    }
};

exports.createScale = async (req, res, next) => {
    try {
        const scale = await gradeService.createScale(req.body);
        return ApiResponse.created(
            res,
            "Grade scale created successfully.",
            scale
        );
    } catch (error) {
        next(error);
    }
};

exports.updateScale = async (req, res, next) => {
    try {
        const scale = await gradeService.updateScale(
            parseInt(req.params.id, 10),
            req.body
        );
        return ApiResponse.success(
            res,
            "Grade scale updated successfully.",
            scale
        );
    } catch (error) {
        next(error);
    }
};

exports.setDefaultScale = async (req, res, next) => {
    try {
        const scale = await gradeService.setDefaultScale(
            parseInt(req.params.id, 10)
        );
        return ApiResponse.success(
            res,
            "Default grade scale updated successfully.",
            scale
        );
    } catch (error) {
        next(error);
    }
};

exports.listGrades = async (req, res, next) => {
    try {
        const grades = await gradeService.listGrades(req.query);
        return ApiResponse.success(
            res,
            "Grade bands retrieved successfully.",
            grades
        );
    } catch (error) {
        next(error);
    }
};

exports.getGradeById = async (req, res, next) => {
    try {
        const grade = await gradeService.getGradeById(
            parseInt(req.params.id, 10)
        );
        return ApiResponse.success(
            res,
            "Grade band retrieved successfully.",
            grade
        );
    } catch (error) {
        next(error);
    }
};

exports.createGrade = async (req, res, next) => {
    try {
        const grade = await gradeService.createGrade(req.body);
        return ApiResponse.created(
            res,
            "Grade band created successfully.",
            grade
        );
    } catch (error) {
        next(error);
    }
};

exports.updateGrade = async (req, res, next) => {
    try {
        const grade = await gradeService.updateGrade(
            parseInt(req.params.id, 10),
            req.body
        );
        return ApiResponse.success(
            res,
            "Grade band updated successfully.",
            grade
        );
    } catch (error) {
        next(error);
    }
};

exports.deactivateGrade = async (req, res, next) => {
    try {
        const grade = await gradeService.deactivateGrade(
            parseInt(req.params.id, 10)
        );
        return ApiResponse.success(
            res,
            "Grade band deactivated successfully.",
            grade
        );
    } catch (error) {
        next(error);
    }
};
