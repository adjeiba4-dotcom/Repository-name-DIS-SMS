const studentService = require("../services/student.service");

exports.getStudents = async(req, res, next) => {
    try {
        const students = await studentService.getStudents();

        res.status(200).json({
            success: true,
            message: "Students retrieved successfully.",
            data: students,
        });
    } catch (error) {
        next(error);
    }
};

exports.getStudentById = async(req, res, next) => {
    try {
        const student = await studentService.getStudentById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Student retrieved successfully.",
            data: student,
        });
    } catch (error) {
        next(error);
    }
};

exports.createStudent = async(req, res, next) => {
    try {
        const student = await studentService.createStudent(req.body);

        res.status(201).json({
            success: true,
            message: "Student created successfully.",
            data: student,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateStudent = async(req, res, next) => {
    try {
        const student = await studentService.updateStudent(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Student updated successfully.",
            data: student,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteStudent = async(req, res, next) => {
    try {
        const result = await studentService.deleteStudent(req.params.id);

        res.status(200).json({
            success: true,
            message: "Student deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};