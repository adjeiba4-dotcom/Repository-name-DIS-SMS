// controllers/classSubject.controller.js

const classSubjectService = require("../services/classSubject.service");
const ApiResponse = require("../utils/response");

exports.getClassSubjects = async (req, res, next) => {
    try {
        const result = await classSubjectService.getClassSubjects(req.query);

        return ApiResponse.paginated(
            res,
            "Class subject allocations retrieved successfully.",
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

exports.getClassSubjectById = async (req, res, next) => {
    try {
        const allocation = await classSubjectService.getClassSubjectById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Class subject allocation retrieved successfully.",
            allocation
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedClassSubjects = async (req, res, next) => {
    try {
        const allocations =
            await classSubjectService.getArchivedClassSubjects();

        return ApiResponse.success(
            res,
            "Archived class subject allocations retrieved successfully.",
            allocations
        );
    } catch (error) {
        next(error);
    }
};

exports.createClassSubject = async (req, res, next) => {
    try {
        const allocation = await classSubjectService.createClassSubject(
            req.body
        );

        return ApiResponse.created(
            res,
            "Class subject allocation created successfully.",
            allocation
        );
    } catch (error) {
        next(error);
    }
};

exports.updateClassSubject = async (req, res, next) => {
    try {
        const allocation = await classSubjectService.updateClassSubject(
            parseInt(req.params.id, 10),
            req.body
        );

        return ApiResponse.success(
            res,
            "Class subject allocation updated successfully.",
            allocation
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteClassSubject = async (req, res, next) => {
    try {
        const allocation = await classSubjectService.deleteClassSubject(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Class subject allocation archived successfully.",
            allocation
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreClassSubject = async (req, res, next) => {
    try {
        const activate =
            req.body?.activate === true || req.query?.activate === "true";

        const allocation = await classSubjectService.restoreClassSubject(
            parseInt(req.params.id, 10),
            { activate }
        );

        return ApiResponse.success(
            res,
            "Class subject allocation restored successfully.",
            allocation
        );
    } catch (error) {
        next(error);
    }
};
