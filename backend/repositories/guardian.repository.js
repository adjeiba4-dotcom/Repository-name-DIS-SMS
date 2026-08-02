const db = require("../database/db");

/**
 * Fields returned for Guardian queries
 */
const guardianSelect = {
    id: true,
    firstName: true,
    lastName: true,
    relationship: true,
    phone: true,
    alternatePhone: true,
    email: true,
    occupation: true,
    address: true,
    status: true,
    createdAt: true,
    updatedAt: true,

    students: {
        select: {
            id: true,
            admissionNo: true,
            firstName: true,
            lastName: true,
            status: true,
        },
    },
};

/**
 * Get all active guardians
 */
exports.findAllGuardians = async () => {
    return await db.guardian.findMany({
        where: {
            deletedAt: null,
        },
        select: guardianSelect,
        orderBy: {
            firstName: "asc",
        },
    });
};

/**
 * Get guardian by ID
 */
exports.findGuardianById = async (id) => {
    return await db.guardian.findUnique({
        where: {
            id: Number(id),
        },
        select: guardianSelect,
    });
};

/**
 * Find guardian by email
 */
exports.findGuardianByEmail = async (email) => {
    if (!email) return null;

    return await db.guardian.findFirst({
        where: {
            email,
            deletedAt: null,
        },
    });
};

/**
 * Search guardians
 */
exports.searchGuardians = async (keyword) => {
    return await db.guardian.findMany({
        where: {
            deletedAt: null,
            OR: [
                {
                    firstName: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    lastName: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    phone: {
                        contains: keyword,
                    },
                },
                {
                    email: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
            ],
        },
        select: guardianSelect,
        orderBy: {
            firstName: "asc",
        },
    });
};
/**
 * Create guardian
 */
exports.createGuardian = async (guardianData) => {
    return await db.guardian.create({
        data: guardianData,
        select: guardianSelect,
    });
};

/**
 * Update guardian
 */
exports.updateGuardian = async (id, guardianData) => {
    return await db.guardian.update({
        where: {
            id: Number(id),
        },
        data: guardianData,
        select: guardianSelect,
    });
};

/**
 * Soft delete guardian
 */
exports.softDeleteGuardian = async (id) => {
    return await db.guardian.update({
        where: {
            id: Number(id),
        },
        data: {
            status: "ARCHIVED",
            deletedAt: new Date(),
        },
    });
};

/**
 * Restore archived guardian
 */
exports.restoreGuardian = async (id) => {
    return await db.guardian.update({
        where: {
            id: Number(id),
        },
        data: {
            status: "ACTIVE",
            deletedAt: null,
        },
        select: guardianSelect,
    });
};

/**
 * Get archived guardians
 */
exports.findArchivedGuardians = async () => {
    return await db.guardian.findMany({
        where: {
            status: "ARCHIVED",
        },
        select: guardianSelect,
        orderBy: {
            updatedAt: "desc",
        },
    });
};