const enrollmentService = require("../services/enrollment.create.service");

exports.createEnrollment = async(req, res) => {
    const enrollment = await enrollmentService.createEnrollment(req.body);

    res.status(201).json({
        success: true,
        message: "Enrollment created successfully.",
        data: enrollment,
    });
};