const academicYearService = require("../services/academicYear.service");

exports.getAcademicYears = async(req, res) => {
    const academicYears = await academicYearService.getAcademicYears();

    res.json({
        success: true,
        message: "Academic years retrieved successfully.",
        data: academicYears,
    });
};