const academicYearRepository = require("../repositories/academicYear.repository");

/**
 * Get all academic years
 */
exports.getAcademicYears = async() => {
    return await academicYearRepository.findAllAcademicYears();
};

/**
 * Get academic year by ID
 */
exports.getAcademicYearById = async(id) => {
    const academicYear = await academicYearRepository.findAcademicYearById(id);

    if (!academicYear) {
        throw new Error("Academic year not found.");
    }

    return academicYear;
};

/**
 * Search academic years
 */
exports.searchAcademicYears = async(keyword) => {
    return await academicYearRepository.searchAcademicYears(keyword);
};

/**
 * Get archived academic years
 */
exports.getArchivedAcademicYears = async() => {
    return await academicYearRepository.findArchivedAcademicYears();
};

/**
 * Create academic year
 */
exports.createAcademicYear = async(data) => {
    const existing = await academicYearRepository.findAcademicYearByName(
        data.name
    );

    if (existing) {
        throw new Error("Academic year already exists.");
    }

    if (new Date(data.startDate) >= new Date(data.endDate)) {
        throw new Error("Start date must be earlier than end date.");
    }

    if (data.isCurrent === true) {
        await academicYearRepository.clearCurrentAcademicYear();
    }

    return await academicYearRepository.createAcademicYear(data);
};

/**
 * Update academic year
 */
exports.updateAcademicYear = async(id, data) => {
    const academicYear = await academicYearRepository.findAcademicYearById(id);

    if (!academicYear) {
        throw new Error("Academic year not found.");
    }

    if (
        data.name &&
        data.name !== academicYear.name
    ) {
        const existing =
            await academicYearRepository.findAcademicYearByName(data.name);

        if (existing) {
            throw new Error("Academic year already exists.");
        }
    }

    const startDate = data.startDate ?
        new Date(data.startDate) :
        new Date(academicYear.startDate);

    const endDate = data.endDate ?
        new Date(data.endDate) :
        new Date(academicYear.endDate);

    if (startDate >= endDate) {
        throw new Error("Start date must be earlier than end date.");
    }

    if (data.isCurrent === true) {
        await academicYearRepository.clearCurrentAcademicYear();
    }

    return await academicYearRepository.updateAcademicYear(id, data);
};

/**
 * Archive academic year
 */
exports.deleteAcademicYear = async(id) => {
    const academicYear = await academicYearRepository.findAcademicYearById(id);

    if (!academicYear) {
        throw new Error("Academic year not found.");
    }

    return await academicYearRepository.softDeleteAcademicYear(id);
};

/**
 * Restore archived academic year
 */
exports.restoreAcademicYear = async(id) => {
    const archivedYears =
        await academicYearRepository.findArchivedAcademicYears();

    const academicYear = archivedYears.find(
        (item) => item.id === id
    );

    if (!academicYear) {
        throw new Error("Archived academic year not found.");
    }

    if (academicYear.deletedAt === null) {
        throw new Error("Academic year is already active.");
    }

    return await academicYearRepository.restoreAcademicYear(id);
};