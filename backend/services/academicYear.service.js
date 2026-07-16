const academicYearRepository = require("../repositories/academicYear.repository");

exports.getAcademicYears = async() => {
    return await academicYearRepository.findAllAcademicYears();
};

exports.getAcademicYearById = async(id) => {
    const academicYear =
        await academicYearRepository.findAcademicYearById(id);

    if (!academicYear) {
        throw new Error("Academic year not found.");
    }

    return academicYear;
};

exports.createAcademicYear = async(academicYearData) => {
    const existingAcademicYear =
        await academicYearRepository.findAcademicYearByName(
            academicYearData.yearName
        );

    if (existingAcademicYear) {
        throw new Error("Academic year already exists.");
    }

    return await academicYearRepository.createAcademicYear(
        academicYearData
    );
};

exports.updateAcademicYear = async(id, academicYearData) => {
    const existingAcademicYear =
        await academicYearRepository.findAcademicYearById(id);

    if (!existingAcademicYear) {
        throw new Error("Academic year not found.");
    }

    if (
        academicYearData.yearName &&
        academicYearData.yearName !== existingAcademicYear.yearName
    ) {
        const duplicate =
            await academicYearRepository.findAcademicYearByName(
                academicYearData.yearName
            );

        if (duplicate) {
            throw new Error("Academic year already exists.");
        }
    }

    return await academicYearRepository.updateAcademicYear(
        id,
        academicYearData
    );
};

exports.deleteAcademicYear = async(id) => {
    const existingAcademicYear =
        await academicYearRepository.findAcademicYearById(id);

    if (!existingAcademicYear) {
        throw new Error("Academic year not found.");
    }

    await academicYearRepository.deleteAcademicYear(id);

    return {
        id: Number(id),
    };
};