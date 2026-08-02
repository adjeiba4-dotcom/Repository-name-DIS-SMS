// controllers/term.controller.js

const termService = require("../services/term.service");
const ApiResponse = require("../utils/response");

exports.getTerms = async(req, res, next) => {
    try {
        const terms = await termService.getTerms();

        return ApiResponse.success(
            res,
            "Terms retrieved successfully.",
            terms
        );
    } catch (error) {
        next(error);
    }
};

exports.getTermById = async(req, res, next) => {
    try {
        const term = await termService.getTermById(
            parseInt(req.params.id)
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

exports.searchTerms = async(req, res, next) => {
    try {
        const { search = "" } = req.query;

        const terms = await termService.searchTerms(search);

        return ApiResponse.success(
            res,
            "Search completed successfully.",
            terms
        );
    } catch (error) {
        next(error);
    }
};

exports.createTerm = async(req, res, next) => {
    try {
        const term = await termService.createTerm(req.body);

        return ApiResponse.created(
            res,
            "Term created successfully.",
            term
        );
    } catch (error) {
        next(error);
    }
};

exports.updateTerm = async(req, res, next) => {
    try {
        const term = await termService.updateTerm(
            parseInt(req.params.id),
            req.body
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

exports.deleteTerm = async(req, res, next) => {
    try {
        await termService.deleteTerm(
            parseInt(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Term archived successfully."
        );
    } catch (error) {
        next(error);
    }
};

exports.restoreTerm = async(req, res, next) => {
    try {
        const term = await termService.restoreTerm(
            parseInt(req.params.id)
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

exports.getArchivedTerms = async(req, res, next) => {
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