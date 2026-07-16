const enrollmentService = require("../services/enrollment.service");

exports.getEnrollments = async(req, res, next) => {
    try {
        const enrollments = await enrollmentService.getEnrollments();

        res.status(200).json({
            success: true,
            message: "Enrollments retrieved successfully.",
            data: enrollments,
        });
    } catch (error) {
        next(error);
    }
};

exports.getEnrollmentById = async(req, res, next) => {
    try {
        const enrollment = await enrollmentService.getEnrollmentById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Enrollment retrieved successfully.",
            data: enrollment,
        });
    } catch (error) {
        next(error);
    }
};

exports.createEnrollment = async(req, res, next) => {
    try {
        const enrollment = await enrollmentService.createEnrollment(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Enrollment created successfully.",
            data: enrollment,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateEnrollment = async(req, res, next) => {
    try {
        const enrollment = await enrollmentService.updateEnrollment(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Enrollment updated successfully.",
            data: enrollment,
        });
    } catch (error) {
        next(error);
    }
};