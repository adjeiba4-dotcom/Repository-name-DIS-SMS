// controllers/guardian.controller.js

const guardianService = require("../services/guardian.service");
const ApiResponse = require("../utils/response");

exports.getGuardians = async (req, res, next) => {
    try {
        const result = await guardianService.getGuardians(req.query);

        return ApiResponse.paginated(
            res,
            "Guardians retrieved successfully.",
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

exports.getGuardianById = async (req, res, next) => {
    try {
        const guardian = await guardianService.getGuardianById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Guardian retrieved successfully.",
            guardian
        );
    } catch (error) {
        next(error);
    }
};

exports.createGuardian = async (req, res, next) => {
    try {
        const guardian = await guardianService.createGuardian(req.body);

        return ApiResponse.created(
            res,
            "Guardian created successfully.",
            guardian
        );
    } catch (error) {
        next(error);
    }
};

exports.updateGuardian = async (req, res, next) => {
    try {
        const guardian = await guardianService.updateGuardian(
            parseInt(req.params.id, 10),
            req.body
        );

        return ApiResponse.success(
            res,
            "Guardian updated successfully.",
            guardian
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteGuardian = async (req, res, next) => {
    try {
        await guardianService.deleteGuardian(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Guardian archived successfully."
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreGuardian = async (req, res, next) => {
    try {
        const guardian = await guardianService.restoreGuardian(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Guardian restored successfully.",
            guardian
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedGuardians = async (req, res, next) => {
    try {
        const guardians = await guardianService.getArchivedGuardians();

        return ApiResponse.success(
            res,
            "Archived guardians retrieved successfully.",
            guardians
        );
    } catch (error) {
        next(error);
    }
};

exports.linkGuardianToStudent = async (req, res, next) => {
    try {
        const link = await guardianService.linkGuardianToStudent(
            parseInt(req.params.studentId, 10),
            req.body
        );

        return ApiResponse.created(
            res,
            "Guardian linked to student successfully.",
            link
        );
    } catch (error) {
        next(error);
    }
};

exports.unlinkGuardianFromStudent = async (req, res, next) => {
    try {
        await guardianService.unlinkGuardianFromStudent(
            parseInt(req.params.studentId, 10),
            parseInt(req.params.guardianId, 10)
        );

        return ApiResponse.success(
            res,
            "Guardian unlinked from student successfully."
        );
    } catch (error) {
        next(error);
    }
};

exports.getGuardiansByStudentId = async (req, res, next) => {
    try {
        const links = await guardianService.getGuardiansByStudentId(
            parseInt(req.params.studentId, 10)
        );

        return ApiResponse.success(
            res,
            "Student guardians retrieved successfully.",
            links
        );
    } catch (error) {
        next(error);
    }
};
