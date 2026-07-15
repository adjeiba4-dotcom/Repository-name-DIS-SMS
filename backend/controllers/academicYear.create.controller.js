const academicYearRepository = require("../repositories/academicYear.repository");

exports.createAcademicYear = async(req, res) => {
    const academicYear = await academicYearRepository.createAcademicYear(req.body);

    res.status(201).json({
        success: true,
        message: "Academic year created successfully.",
        data: academicYear,
    });
};