const teacherService = require("../services/teacher.service");

exports.getTeachers = async(req, res, next) => {
    try {
        const { search = "" } = req.query;

        const teachers = await teacherService.getTeachers(search);

        res.status(200).json({
            success: true,
            message: "Teachers retrieved successfully.",
            data: teachers,
        });
    } catch (error) {
        next(error);
    }
};

exports.getTeacherById = async(req, res, next) => {
    try {
        const teacher = await teacherService.getTeacherById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Teacher retrieved successfully.",
            data: teacher,
        });
    } catch (error) {
        next(error);
    }
};

exports.createTeacher = async(req, res, next) => {
    try {
        const teacher = await teacherService.createTeacher(req.body);

        res.status(201).json({
            success: true,
            message: "Teacher created successfully.",
            data: teacher,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateTeacher = async(req, res, next) => {
    try {
        const teacher = await teacherService.updateTeacher(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Teacher updated successfully.",
            data: teacher,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteTeacher = async(req, res, next) => {
    try {
        await teacherService.deleteTeacher(req.params.id);

        res.status(200).json({
            success: true,
            message: "Teacher deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
};