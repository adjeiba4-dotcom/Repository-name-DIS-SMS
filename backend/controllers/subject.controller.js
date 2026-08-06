// controllers/subject.controller.js

const subjectService = require("../services/subject.service");
const ApiResponse = require("../utils/response");

function actorFrom(req) {
    return {
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get?.("user-agent") || null,
    };
}

exports.getSubjects = async (req, res, next) => {
    try {
        const result = await subjectService.getSubjects(req.query);

        return ApiResponse.paginated(
            res,
            "Subjects retrieved successfully.",
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

exports.getSubjectById = async (req, res, next) => {
    try {
        const subject = await subjectService.getSubjectById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Subject retrieved successfully.",
            subject
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedSubjects = async (req, res, next) => {
    try {
        const subjects = await subjectService.getArchivedSubjects();

        return ApiResponse.success(
            res,
            "Archived subjects retrieved successfully.",
            subjects
        );
    } catch (error) {
        next(error);
    }
};

exports.createSubject = async (req, res, next) => {
    try {
        const subject = await subjectService.createSubject(
            req.body,
            actorFrom(req)
        );

        return ApiResponse.created(
            res,
            "Subject created successfully.",
            subject
        );
    } catch (error) {
        next(error);
    }
};

exports.updateSubject = async (req, res, next) => {
    try {
        const subject = await subjectService.updateSubject(
            parseInt(req.params.id, 10),
            req.body,
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Subject updated successfully.",
            subject
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteSubject = async (req, res, next) => {
    try {
        const subject = await subjectService.deleteSubject(
            parseInt(req.params.id, 10),
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Subject archived successfully.",
            subject
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreSubject = async (req, res, next) => {
    try {
        const activate =
            req.body?.activate === true || req.query?.activate === "true";

        const subject = await subjectService.restoreSubject(
            parseInt(req.params.id, 10),
            { activate },
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Subject restored successfully.",
            subject
        );
    } catch (error) {
        next(error);
    }
};
