const subjectService = require("../services/subject.service");
const ApiResponse = require("../utils/response");

/**
 * Get all subjects
 */
exports.getSubjects = async (req, res, next) => {
    try {
        const subjects = await subjectService.getSubjects();

        return ApiResponse.success(
            res,
            "Subjects retrieved successfully.",
            subjects
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get subject by ID
 */
exports.getSubjectById = async (req, res, next) => {
    try {
        const subject = await subjectService.getSubjectById(
            req.params.id
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

/**
 * Search subjects
 */
exports.searchSubjects = async (req, res, next) => {
    try {
        const keyword = req.query.keyword || "";

        const subjects =
            await subjectService.searchSubjects(keyword);

        return ApiResponse.success(
            res,
            "Search completed successfully.",
            subjects
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get archived subjects
 */
exports.getArchivedSubjects = async (req, res, next) => {
    try {
        const subjects =
            await subjectService.getArchivedSubjects();

        return ApiResponse.success(
            res,
            "Archived subjects retrieved successfully.",
            subjects
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create subject
 */
exports.createSubject = async (req, res, next) => {
    try {
        const subject =
            await subjectService.createSubject(req.body);

        return ApiResponse.created(
            res,
            "Subject created successfully.",
            subject
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update subject
 */
exports.updateSubject = async (req, res, next) => {
    try {
        const subject =
            await subjectService.updateSubject(
                req.params.id,
                req.body
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

/**
 * Archive subject
 */
exports.deleteSubject = async (req, res, next) => {
    try {
        await subjectService.deleteSubject(req.params.id);

        return ApiResponse.success(
            res,
            "Subject archived successfully."
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Restore subject
 */
exports.restoreSubject = async (req, res, next) => {
    try {
        const subject =
            await subjectService.restoreSubject(
                req.params.id
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