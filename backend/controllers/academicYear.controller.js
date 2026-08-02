const academicYearService = require("../services/academicYear.service");
const ApiResponse = require("../utils/response");

/**
 * Get all academic years
 */
exports.getAcademicYears = async(req, res, next) => {
    try {
        const academicYears = await academicYearService.getAcademicYears();

        return ApiResponse.success(
            res,
            "Academic years retrieved successfully.",
            academicYears
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get academic year by ID
 */
exports.getAcademicYearById = async(req, res, next) => {
    try {
        const academicYear = await academicYearService.getAcademicYearById(
            Number(req.params.id)
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

/**
 * Search academic years
 */
exports.searchAcademicYears = async(req, res, next) => {
    try {
        const academicYears = await academicYearService.searchAcademicYears(
            req.query.keyword
        );

        return ApiResponse.success(
            res,
            "Academic years retrieved successfully.",
            academicYears
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get archived academic years
 */
exports.getArchivedAcademicYears = async(req, res, next) => {
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

/**
 * Create academic year
 */
exports.createAcademicYear = async(req, res, next) => {
    try {
        const academicYear =
            await academicYearService.createAcademicYear(req.body);

        return ApiResponse.created(
            res,
            "Academic year created successfully.",
            academicYear
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update academic year
 */
exports.updateAcademicYear = async(req, res, next) => {
    try {
        const academicYear =
            await academicYearService.updateAcademicYear(
                Number(req.params.id),
                req.body
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

/**
 * Archive academic year
 */
exports.deleteAcademicYear = async(req, res, next) => {
    try {
        const academicYear =
            await academicYearService.deleteAcademicYear(
                Number(req.params.id)
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

/**
 * Restore archived academic year
 */
exports.restoreAcademicYear = async(req, res, next) => {
    try {
        const academicYear =
            await academicYearService.restoreAcademicYear(
                Number(req.params.id)
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