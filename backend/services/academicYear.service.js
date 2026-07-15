const academicYearRepository = require("../repositories/academicYear.repository");

exports.getAcademicYears = async() => {
    return await academicYearRepository.findAllAcademicYears();
};