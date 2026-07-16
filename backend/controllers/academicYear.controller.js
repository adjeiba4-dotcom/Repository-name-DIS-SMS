const academicYearService = require("../services/academicYear.service");

exports.getAcademicYears = async(req, res, next) => {
    try {
        const academicYears =
            await academicYearService.getAcademicYears();

        res.status(200).json({
            success: true,
            message: "Academic years retrieved successfully.",
            data: academicYears,
        });
    } catch (error) {
        next(error);
    }
};

exports.getAcademicYearById = async(req, res, next) => {
    try {
        const academicYear =
            await academicYearService.getAcademicYearById(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Academic year retrieved successfully.",
            data: academicYear,
        });
    } catch (error) {
        next(error);
    }
};

exports.createAcademicYear = async(req, res, next) => {
    try {
        const academicYear =
            await academicYearService.createAcademicYear(
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Academic year created successfully.",
            data: academicYear,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAcademicYear = async(req, res, next) => {
    try {
        const academicYear =
            await academicYearService.updateAcademicYear(
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Academic year updated successfully.",
            data: academicYear,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteAcademicYear = async(req, res, next) => {
    try {
        const result =
            await academicYearService.deleteAcademicYear(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Academic year deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};