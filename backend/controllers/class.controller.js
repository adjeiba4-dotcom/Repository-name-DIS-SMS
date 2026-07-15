const classService = require("../services/class.service");

exports.getClasses = async(req, res, next) => {
    try {
        const classes = await classService.getClasses();

        res.status(200).json({
            success: true,
            message: "Classes retrieved successfully.",
            data: classes,
        });
    } catch (error) {
        next(error);
    }
};

exports.getClassById = async(req, res, next) => {
    try {
        const classData = await classService.getClassById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Class retrieved successfully.",
            data: classData,
        });
    } catch (error) {
        next(error);
    }
};

exports.createClass = async(req, res, next) => {
    try {
        const classData = await classService.createClass(req.body);

        res.status(201).json({
            success: true,
            message: "Class created successfully.",
            data: classData,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateClass = async(req, res, next) => {
    try {
        const classData = await classService.updateClass(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Class updated successfully.",
            data: classData,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteClass = async(req, res, next) => {
    try {
        const result = await classService.deleteClass(req.params.id);

        res.status(200).json({
            success: true,
            message: "Class deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};