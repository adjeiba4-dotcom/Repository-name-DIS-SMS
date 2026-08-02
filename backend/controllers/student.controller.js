const studentService = require("../services/student.service");
const ApiResponse = require("../utils/response");

/**
 * Get all students
 */
exports.getStudents = async (req, res, next) => {
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

/**
 * Get student by ID
 */
exports.getStudentById = async (req, res, next) => {
    try {
        const student = await studentService.getStudentById(
            req.params.id
        );

        return ApiResponse.success(
            res,
            "Student retrieved successfully.",
            student
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search students
 */
exports.searchStudents = async (req, res, next) => {
    try {
        const keyword = req.query.search || "";

        const students =
            await studentService.searchStudents(keyword);

        return ApiResponse.success(
            res,
            "Students retrieved successfully.",
            students
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create student
 */
exports.createStudent = async (req, res, next) => {
    try {
        const student =
            await studentService.createStudent(req.body);

        return ApiResponse.created(
            res,
            "Student created successfully.",
            student
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update student
 */
exports.updateStudent = async (req, res, next) => {
    try {
        const student =
            await studentService.updateStudent(
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

/**
 * Archive student
 */
exports.deleteStudent = async (req, res, next) => {
    try {
        await studentService.deleteStudent(req.params.id);

        return ApiResponse.success(
            res,
            "Student archived successfully."
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Restore student
 */
exports.restoreStudent = async (req, res, next) => {
    try {
        const student =
            await studentService.restoreStudent(
                req.params.id
            );

        return ApiResponse.success(
            res,
            "Student restored successfully.",
            student
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get archived students
 */
exports.getArchivedStudents = async (req, res, next) => {
    try {
        const students =
            await studentService.getArchivedStudents();

        return ApiResponse.success(
            res,
            "Archived students retrieved successfully.",
            students
        );
    } catch (error) {
        next(error);
    }
};