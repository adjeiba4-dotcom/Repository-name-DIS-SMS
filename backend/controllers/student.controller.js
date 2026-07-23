const studentService = require("../services/student.service");
const ApiResponse = require("../utils/response");

exports.getStudents = async(req, res, next) => {
    try {
        const students = await studentService.getStudents();

        return ApiResponse.success(
            res,
            "Students retrieved successfully.",
            students
        );
    } catch (error) {
        next(error);
    }
};

exports.getStudentById = async(req, res, next) => {
    try {
        const student = await studentService.getStudentById(req.params.id);

        return ApiResponse.success(
            res,
            "Student retrieved successfully.",
            student
        );
    } catch (error) {
        next(error);
    }
};

exports.createStudent = async(req, res, next) => {
    try {
        const student = await studentService.createStudent(req.body);

        return ApiResponse.created(
            res,
            "Student created successfully.",
            student
        );
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

        return ApiResponse.success(
            res,
            "Student updated successfully.",
            student
        );
    } catch (error) {
        next(error);
    }
};

exports.deleteStudent = async(req, res, next) => {
    try {
        const result = await studentService.deleteStudent(req.params.id);

        return ApiResponse.success(
            res,
            "Student archived successfully.",
            result
        );
    } catch (error) {
        next(error);
    }
};