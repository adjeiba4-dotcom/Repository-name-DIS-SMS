// controllers/term.controller.js

const termService = require("../services/term.service");
const ApiResponse = require("../utils/response");

function actorFrom(req) {
    return {
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get?.("user-agent") || null,
    };
}

exports.getTerms = async (req, res, next) => {
    try {
        const result = await termService.getTerms(req.query);

        return ApiResponse.paginated(
            res,
            "Terms retrieved successfully.",
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

exports.getTermById = async (req, res, next) => {
    try {
        const term = await termService.getTermById(
            parseInt(req.params.id, 10)
        );

        return ApiResponse.success(
            res,
            "Term retrieved successfully.",
            term
        );
    } catch (error) {
        next(error);
    }
};

exports.getArchivedTerms = async (req, res, next) => {
    try {
        const terms = await termService.getArchivedTerms();

        return ApiResponse.success(
            res,
            "Archived terms retrieved successfully.",
            terms
        );
    } catch (error) {
        next(error);
    }
};

exports.createTerm = async (req, res, next) => {
    try {
        const term = await termService.createTerm(req.body, actorFrom(req));

        return ApiResponse.created(
            res,
            "Term created successfully.",
            term
        );
    } catch (error) {
        next(error);
    }
};

exports.updateTerm = async (req, res, next) => {
    try {
        const term = await termService.updateTerm(
            parseInt(req.params.id, 10),
            req.body,
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Term updated successfully.",
            term
        );
    } catch (error) {
        next(error);
    }
};

exports.activateTerm = async (req, res, next) => {
    try {
        const term = await termService.activateTerm(
            parseInt(req.params.id, 10),
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Term activated successfully.",
            term
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteTerm = async (req, res, next) => {
    try {
        const term = await termService.deleteTerm(
            parseInt(req.params.id, 10),
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Term archived successfully.",
            term
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreTerm = async (req, res, next) => {
    try {
        const activate =
            req.body?.activate === true || req.query?.activate === "true";

        const term = await termService.restoreTerm(
            parseInt(req.params.id, 10),
            { activate },
            actorFrom(req)
        );

        return ApiResponse.success(
            res,
            "Term restored successfully.",
            term
        );
    } catch (error) {
        next(error);
    }
};
