// repositories/reportCard.repository.js

const prisma = require("../database/db");

/**
 * Get all report cards
 */
const findAllReportCards = async() => {
    return await prisma.reportCard.findMany({
        include: {
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
            academicYear: true,
            term: true,
            results: {
                include: {
                    subject: true,
                    examination: true,
                },
            },
        },
        orderBy: [{
                academicYear: {
                    name: "desc",
                },
            },
            {
                term: {
                    name: "asc",
                },
            },
            {
                student: {
                    firstName: "asc",
                },
            },
        ],
    });
};

/**
 * Get report card by ID
 */
const findReportCardById = async(id) => {
    return await prisma.reportCard.findUnique({
        where: {
            id: Number(id),
        },
        include: {
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
            academicYear: true,
            term: true,
            results: {
                include: {
                    subject: true,
                    examination: true,
                },
            },
        },
    });
};

/**
 * Find report card
 */
const findReportCard = async(
    studentId,
    academicYearId,
    termId
) => {
    return await prisma.reportCard.findFirst({
        where: {
            studentId: Number(studentId),
            academicYearId: Number(academicYearId),
            termId: Number(termId),
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
 * Academic year lookup
 */
const findAcademicYearById = async(
    academicYearId
) => {
    return await prisma.academicYear.findUnique({
        where: {
            id: Number(academicYearId),
        },
    });
};

/**
 * Term lookup
 */
const findTermById = async(termId) => {
    return await prisma.term.findUnique({
        where: {
            id: Number(termId),
        },
    });
};

/**
 * Get student's examination results
 */
const findStudentResults = async(
    studentId,
    academicYearId,
    termId
) => {
    return await prisma.result.findMany({
        where: {
            studentId: Number(studentId),
            termId: Number(termId),
            examination: {
                academicYearId: Number(
                    academicYearId
                ),
            },
        },
        include: {
            subject: true,
            examination: true,
        },
        orderBy: {
            subject: {
                subjectName: "asc",
            },
        },
    });
};

/**
 * Search report cards
 */
const searchReportCards = async(keyword) => {
    return await prisma.reportCard.findMany({
        where: {
            OR: [{
                    student: {
                        firstName: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    student: {
                        lastName: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    student: {
                        admissionNumber: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    academicYear: {
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
        include: {
            student: {
                include: {
                    schoolClass: true,
                },
            },
            academicYear: true,
            term: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Create report card
 */
const createReportCard = async(data) => {
    return await prisma.reportCard.create({
        data,
        include: {
            student: true,
            academicYear: true,
            term: true,
        },
    });
};

/**
 * Update report card
 */
const updateReportCard = async(
    id,
    data
) => {
    return await prisma.reportCard.update({
        where: {
            id: Number(id),
        },
        data,
        include: {
            student: true,
            academicYear: true,
            term: true,
        },
    });
};

/**
 * Delete report card
 */
const deleteReportCard = async(id) => {
    return await prisma.reportCard.delete({
        where: {
            id: Number(id),
        },
    });
};

module.exports = {
    findAllReportCards,
    findReportCardById,
    findReportCard,
    findStudentById,
    findAcademicYearById,
    findTermById,
    findStudentResults,
    searchReportCards,
    createReportCard,
    updateReportCard,
    deleteReportCard,
};