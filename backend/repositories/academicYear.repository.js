const prisma = require("../database/db");

const academicYearSelect = {
    id: true,
    name: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,

    terms: {
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
        },
    },

    enrollments: {
        select: {
            id: true,
            enrollmentDate: true,
            status: true,
        },
    },

    attendance: {
        select: {
            id: true,
            attendanceDate: true,
            status: true,
        },
    },

    examinations: {
        select: {
            id: true,
            title: true,
            status: true,
        },
    },

    feeStructures: {
        select: {
            id: true,
            amount: true,
            status: true,
        },
    },

    bedAllocations: {
        select: {
            id: true,
            allocatedAt: true,
        },
    },
};

/**
 * Get all active academic years
 */
exports.findAllAcademicYears = () => {
    return prisma.academicYear.findMany({
        where: {
            deletedAt: null,
        },
        select: academicYearSelect,
        orderBy: {
            startDate: "desc",
        },
    });
};

/**
 * Get academic year by ID
 */
exports.findAcademicYearById = (id) => {
    return prisma.academicYear.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        select: academicYearSelect,
    });
};

/**
 * Find academic year by name
 */
exports.findAcademicYearByName = (name) => {
    return prisma.academicYear.findFirst({
        where: {
            name,
            deletedAt: null,
        },
        select: academicYearSelect,
    });
};

/**
 * Find current academic year
 */
exports.findCurrentAcademicYear = () => {
    return prisma.academicYear.findFirst({
        where: {
            deletedAt: null,
            isCurrent: true,
        },
        select: academicYearSelect,
    });
};

/**
 * Search academic years
 */
exports.searchAcademicYears = (keyword) => {
    return prisma.academicYear.findMany({
        where: {
            deletedAt: null,
            name: {
                contains: keyword,
            },
        },
        select: academicYearSelect,
        orderBy: {
            startDate: "desc",
        },
    });
};

/**
 * Create academic year
 */
exports.createAcademicYear = (data) => {
    return prisma.academicYear.create({
        data,
        select: academicYearSelect,
    });
};

/**
 * Update academic year
 */
exports.updateAcademicYear = (id, data) => {
    return prisma.academicYear.update({
        where: {
            id,
        },
        data,
        select: academicYearSelect,
    });
};

/**
 * Clear current academic year
 */
exports.clearCurrentAcademicYear = () => {
    return prisma.academicYear.updateMany({
        where: {
            isCurrent: true,
            deletedAt: null,
        },
        data: {
            isCurrent: false,
        },
    });
};

/**
 * Soft delete academic year
 */
exports.softDeleteAcademicYear = (id) => {
    return prisma.academicYear.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
        select: academicYearSelect,
    });
};

/**
 * Restore academic year
 */
exports.restoreAcademicYear = (id) => {
    return prisma.academicYear.update({
        where: {
            id,
        },
        data: {
            deletedAt: null,
        },
        select: academicYearSelect,
    });
};

/**
 * Get archived academic years
 */
exports.findArchivedAcademicYears = () => {
    return prisma.academicYear.findMany({
        where: {
            deletedAt: {
                not: null,
            },
        },
        select: academicYearSelect,
        orderBy: {
            startDate: "desc",
        },
    });
};