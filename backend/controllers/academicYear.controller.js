// controllers/academicYear.controller.js

const academicYearService = require("../services/academicYear.service");
const ApiResponse = require("../utils/response");

function actorFrom(req) {
    return {
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get?.("user-agent") || null,
    };
}

exports.getAcademicYears = async (req, res, next) => {
    try {
        const result = await academicYearService.getAcademicYears(req.query);

        return ApiResponse.paginated(
            res,
            "Academic years retrieved successfully.",
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

exports.getAcademicYearById = async (req, res, next) => {
    try {
        const academicYear = await academicYearService.getAcademicYearById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Academic year retrieved successfully.",
            academicYear
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedAcademicYears = async (req, res, next) => {
    try {
        const academicYears =
            await academicYearService.getArchivedAcademicYears();

        return ApiResponse.success(
            res,
            "Archived academic years retrieved successfully.",
            academicYears
        );
    } catch (error) {
        next(error);
    }
};

exports.createAcademicYear = async (req, res, next) => {
    try {
        const academicYear = await academicYearService.createAcademicYear(
            req.body,
            actorFrom(req)
        );

        return ApiResponse.created(
            res,
            "Academic year created successfully.",
            academicYear
        );
    } catch (error) {
        next(error);
    }
};

exports.updateAcademicYear = async (req, res, next) => {
    try {
        const academicYear = await academicYearService.updateAcademicYear(
            parseInt(req.params.id, 10),
            req.body,
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Academic year updated successfully.",
            academicYear
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteAcademicYear = async (req, res, next) => {
    try {
        const academicYear = await academicYearService.deleteAcademicYear(
            parseInt(req.params.id, 10),
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Academic year archived successfully.",
            academicYear
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreAcademicYear = async (req, res, next) => {
    try {
        const activate =
            req.body?.activate === true || req.query?.activate === "true";

        const academicYear = await academicYearService.restoreAcademicYear(
            parseInt(req.params.id, 10),
            { activate },
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Academic year restored successfully.",
            academicYear
        );
    } catch (error) {
        next(error);
    }
};
