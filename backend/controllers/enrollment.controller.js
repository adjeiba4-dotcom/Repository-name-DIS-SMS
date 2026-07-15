const enrollmentService = require("../services/enrollment.service");

exports.getEnrollments = async(req, res) => {
    const enrollments = await enrollmentService.getEnrollments();

    res.json({
        success: true,
        message: "Enrollments retrieved successfully.",
        data: enrollments,
    });
};