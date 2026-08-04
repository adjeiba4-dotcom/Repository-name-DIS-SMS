const prisma = require("../database/db");

/**
 * Common include used across Result queries.
 */
const resultInclude = {
    student: {
        include: {
            studentGuardians: {
                include: {
                    guardian: true,
                },
            },
            schoolClass: true,
        },
    },
    examination: true,
    subject: true,
    term: true,
};

/**
 * Get all results
 */
const findAllResults = async() => {
    return await prisma.result.findMany({
        include: resultInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Get result by ID
 */
const findResultById = async(id) => {
    return await prisma.result.findUnique({
        where: {
            id: Number(id),
        },
        include: resultInclude,
    });
};

/**
 * Find duplicate result
 * (One result per student per examination)
 */
const findResult = async(
    studentId,
    examinationId
) => {
    return await prisma.result.findUnique({
        where: {
            studentId_examinationId: {
                studentId: Number(studentId),
                examinationId: Number(examinationId),
            },
        },
    });
};

/**
 * Create result
 */
const createResult = async(data) => {
    return await prisma.result.create({
        data,
        include: resultInclude,
    });
};

/**
 * Update result
 */
const updateResult = async(id, data) => {
    return await prisma.result.update({
        where: {
            id: Number(id),
        },
        data,
        include: resultInclude,
    });
};

/**
 * Delete result
 */
const deleteResult = async(id) => {
    return await prisma.result.delete({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Student lookup
 */
const findStudentById = async(studentId) => {
    return await prisma.student.findUnique({
        where: {
            id: Number(studentId),
        },
    });
};

/**
 * Examination lookup
 */
const findExaminationById = async(
    examinationId
) => {
    return await prisma.examination.findUnique({
        where: {
            id: Number(examinationId),
        },
    });
};

/**
 * Subject lookup
 */
const findSubjectById = async(
    subjectId
) => {
    return await prisma.subject.findUnique({
        where: {
            id: Number(subjectId),
        },
    });
};

/**
 * Term lookup
 */
const findTermById = async(
    termId
) => {
    return await prisma.term.findUnique({
        where: {
            id: Number(termId),
        },
    });
};

/**
 * Search results
 */
const searchResults = async(keyword) => {
    return await prisma.result.findMany({
        where: {
            OR: [{
                    grade: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    remarks: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    student: {
                        OR: [{
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
                                admissionNo: {
                                    contains: keyword,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                },
                {
                    examination: {
                        name: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    subject: {
                        name: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    term: {
                        name: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        },
        include: resultInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

module.exports = {
    findAllResults,
    findResultById,
    findResult,
    createResult,
    updateResult,
    deleteResult,
    findStudentById,
    findExaminationById,
    findSubjectById,
    findTermById,
    searchResults,
};