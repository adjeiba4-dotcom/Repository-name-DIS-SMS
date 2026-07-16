const subjectService = require("../services/subject.service");

exports.getSubjects = async(req, res, next) => {
    try {
        const subjects = await subjectService.getSubjects();

        res.status(200).json({
            success: true,
            message: "Subjects retrieved successfully.",
            data: subjects,
        });
    } catch (error) {
        next(error);
    }
};

exports.getSubjectById = async(req, res, next) => {
    try {
        const subject = await subjectService.getSubjectById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Subject retrieved successfully.",
            data: subject,
        });
    } catch (error) {
        next(error);
    }
};

exports.createSubject = async(req, res, next) => {
    try {
        const subject = await subjectService.createSubject(req.body);

        res.status(201).json({
            success: true,
            message: "Subject created successfully.",
            data: subject,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateSubject = async(req, res, next) => {
    try {
        const subject = await subjectService.updateSubject(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Subject updated successfully.",
            data: subject,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteSubject = async(req, res, next) => {
    try {
        const result = await subjectService.deleteSubject(req.params.id);

        res.status(200).json({
            success: true,
            message: "Subject deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};