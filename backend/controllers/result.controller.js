const resultService = require("../services/result.service");

exports.getResults = async(req, res, next) => {
    try {
        const results = await resultService.getResults();

        res.status(200).json({
            success: true,
            message: "Results retrieved successfully.",
            data: results,
        });
    } catch (error) {
        next(error);
    }
};

exports.getResultById = async(req, res, next) => {
    try {
        const result = await resultService.getResultById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Result retrieved successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.createResult = async(req, res, next) => {
    try {
        const result = await resultService.createResult(req.body);

        res.status(201).json({
            success: true,
            message: "Result created successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateResult = async(req, res, next) => {
    try {
        const result = await resultService.updateResult(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Result updated successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteResult = async(req, res, next) => {
    try {
        const result = await resultService.deleteResult(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Result deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};