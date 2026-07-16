const examinationService = require("../services/examination.service");

exports.getExaminations = async(req, res, next) => {
    try {
        const examinations = await examinationService.getExaminations();

        res.status(200).json({
            success: true,
            message: "Examinations retrieved successfully.",
            data: examinations,
        });
    } catch (error) {
        next(error);
    }
};

exports.getExaminationById = async(req, res, next) => {
    try {
        const examination =
            await examinationService.getExaminationById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Examination retrieved successfully.",
            data: examination,
        });
    } catch (error) {
        next(error);
    }
};

exports.createExamination = async(req, res, next) => {
    try {
        const examination =
            await examinationService.createExamination(req.body);

        res.status(201).json({
            success: true,
            message: "Examination created successfully.",
            data: examination,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateExamination = async(req, res, next) => {
    try {
        const examination =
            await examinationService.updateExamination(
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Examination updated successfully.",
            data: examination,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteExamination = async(req, res, next) => {
    try {
        const result =
            await examinationService.deleteExamination(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Examination deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};