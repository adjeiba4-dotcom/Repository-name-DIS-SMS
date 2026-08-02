const prisma = require("../database/db");

const classSelect = {
    id: true,
    code: true,
    name: true,
    level: true,
    capacity: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,

    students: {
        select: {
            id: true,
            admissionNumber: true,
            firstName: true,
            lastName: true,
        },
    },

    enrollments: {
        select: {
            id: true,
            enrollmentDate: true,
            status: true,
        },
    },

    subjects: {
        select: {
            id: true,
            code: true,
            name: true,
        },
    },

    feeStructures: {
        select: {
            id: true,
            amount: true,
            status: true,
        },
    },
};

/**
 * Get all active classes
 */
exports.findAllClasses = () => {
    return prisma.schoolClass.findMany({
        where: {
            deletedAt: null,
        },
        select: classSelect,
        orderBy: {
            name: "asc",
        },
    });
};

/**
 * Get class by ID
 */
exports.findClassById = (id) => {
    return prisma.schoolClass.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        select: classSelect,
    });
};

/**
 * Find class by code
 */
exports.findClassByCode = (code) => {
    return prisma.schoolClass.findFirst({
        where: {
            code,
            deletedAt: null,
        },
        select: classSelect,
    });
};

/**
 * Find class by name
 */
exports.findClassByName = (name) => {
    return prisma.schoolClass.findFirst({
        where: {
            name,
            deletedAt: null,
        },
        select: classSelect,
    });
};

/**
 * Search classes
 */
exports.searchClasses = (keyword) => {
    return prisma.schoolClass.findMany({
        where: {
            deletedAt: null,
            OR: [{
                    code: {
                        contains: keyword,
                    },
                },
                {
                    name: {
                        contains: keyword,
                    },
                },
                {
                    level: {
                        contains: keyword,
                    },
                },
            ],
        },
        select: classSelect,
        orderBy: {
            name: "asc",
        },
    });
};

/**
 * Create class
 */
exports.createClass = (data) => {
    return prisma.schoolClass.create({
        data,
        select: classSelect,
    });
};

/**
 * Update class
 */
exports.updateClass = (id, data) => {
    return prisma.schoolClass.update({
        where: {
            id,
        },
        data,
        select: classSelect,
    });
};

/**
 * Soft delete class
 */
exports.softDeleteClass = (id) => {
    return prisma.schoolClass.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        },
        select: classSelect,
    });
};

/**
 * Restore class
 */
exports.restoreClass = (id) => {
    return prisma.schoolClass.update({
        where: {
            id,
        },
        data: {
            deletedAt: null,
        },
        select: classSelect,
    });
};

/**
 * Get archived classes
 */
exports.findArchivedClasses = () => {
    return prisma.schoolClass.findMany({
        where: {
            deletedAt: {
                not: null,
            },
        },
        select: classSelect,
        orderBy: {
            name: "asc",
        },
    });
};