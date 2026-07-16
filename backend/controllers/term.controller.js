const termService = require("../services/term.service");

exports.getTerms = async(req, res, next) => {
    try {
        const terms = await termService.getTerms();

        res.status(200).json({
            success: true,
            message: "Terms retrieved successfully.",
            data: terms,
        });
    } catch (error) {
        next(error);
    }
};

exports.getTermById = async(req, res, next) => {
    try {
        const term = await termService.getTermById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Term retrieved successfully.",
            data: term,
        });
    } catch (error) {
        next(error);
    }
};

exports.createTerm = async(req, res, next) => {
    try {
        const term = await termService.createTerm(req.body);

        res.status(201).json({
            success: true,
            message: "Term created successfully.",
            data: term,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateTerm = async(req, res, next) => {
    try {
        const term = await termService.updateTerm(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Term updated successfully.",
            data: term,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteTerm = async(req, res, next) => {
    try {
        const result = await termService.deleteTerm(req.params.id);

        res.status(200).json({
            success: true,
            message: "Term deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};