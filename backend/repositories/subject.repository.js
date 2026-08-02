const db = require("../database/db");

/**
 * Fields returned for Subject queries
 */
const subjectSelect = {
    id: true,
    code: true,
    name: true,
    description: true,
    creditHours: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,

    department: {
        select: {
            id: true,
            name: true,
        },
    },

    schoolClass: {
        select: {
            id: true,
            name: true,
        },
    },

    teacherSubjects: {
        select: {
            id: true,
            teacher: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    },
};

/**
 * Get all active subjects
 */
exports.findAllSubjects = async () => {
    return db.subject.findMany({
        where: {
            deletedAt: null,
        },
        select: subjectSelect,
        orderBy: {
            name: "asc",
        },
    });
};

/**
 * Get subject by ID
 */
exports.findSubjectById = async (id) => {
    return db.subject.findUnique({
        where: {
            id: Number(id),
        },
        select: subjectSelect,
    });
};

/**
 * Get subject by code
 */
exports.findSubjectByCode = async (code) => {
    return db.subject.findFirst({
        where: {
            code,
            deletedAt: null,
        },
    });
};

/**
 * Search subjects
 */
exports.searchSubjects = async (keyword) => {
    return db.subject.findMany({
        where: {
            deletedAt: null,
            OR: [
                {
                    name: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    code: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
            ],
        },
        select: subjectSelect,
        orderBy: {
            name: "asc",
        },
    });
};

/**
 * Create subject
 */
exports.createSubject = async (data) => {
    return db.subject.create({
        data,
        select: subjectSelect,
    });
};

/**
 * Update subject
 */
exports.updateSubject = async (id, data) => {
    return db.subject.update({
        where: {
            id: Number(id),
        },
        data,
        select: subjectSelect,
    });
};

/**
 * Archive subject
 */
exports.softDeleteSubject = async (id) => {
    return db.subject.update({
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
 * Restore subject
 */
exports.restoreSubject = async (id) => {
    return db.subject.update({
        where: {
            id: Number(id),
        },
        data: {
            status: "ACTIVE",
            deletedAt: null,
        },
        select: subjectSelect,
    });
};

/**
 * Archived subjects
 */
exports.findArchivedSubjects = async () => {
    return db.subject.findMany({
        where: {
            status: "ARCHIVED",
        },
        select: subjectSelect,
        orderBy: {
            updatedAt: "desc",
        },
    });
};