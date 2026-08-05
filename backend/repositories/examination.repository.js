// repositories/examination.repository.js

const prisma = require("../database/db");

const findAllExaminations = async() => {
    return await prisma.examination.findMany({
        include: {
            subject: true,
            teacher: true,
            academicYear: true,
            term: true,
            results: true,
        },
        orderBy: {
            examinationDate: "desc",
        },
    });
};

const findExaminationById = async(id) => {
    return await prisma.examination.findUnique({
        where: { id: Number(id) },
        include: {
            subject: true,
            teacher: true,
            academicYear: true,
            term: true,
            results: true,
        },
    });
};

const findExamination = async(
    name,
    subjectId,
    academicYearId,
    termId
) => {
    return await prisma.examination.findFirst({
        where: {
            name,
            subjectId: Number(subjectId),
            academicYearId: Number(academicYearId),
            termId: Number(termId),
        },
    });
};

const createExamination = async(data) => {
    return await prisma.examination.create({
        data,
        include: {
            subject: true,
            teacher: true,
            academicYear: true,
            term: true,
        },
    });
};

const updateExamination = async(id, data) => {
    return await prisma.examination.update({
        where: { id: Number(id) },
        data,
        include: {
            subject: true,
            teacher: true,
            academicYear: true,
            term: true,
        },
    });
};

const deleteExamination = async(id) => {
    return await prisma.examination.delete({
        where: { id: Number(id) },
    });
};

const findSubjectById = async(subjectId) => {
    return await prisma.subject.findUnique({
        where: { id: Number(subjectId) },
    });
};

const findTeacherById = async(teacherId) => {
    return await prisma.teacher.findUnique({
        where: { id: Number(teacherId) },
    });
};

const findAcademicYearById = async(academicYearId) => {
    return await prisma.academicYear.findUnique({
        where: { id: Number(academicYearId) },
    });
};

const findTermById = async(termId) => {
    return await prisma.term.findUnique({
        where: { id: Number(termId) },
    });
};

const searchExaminations = async(keyword) => {
    return await prisma.examination.findMany({
        where: {
            OR: [{
                    name: {
                        contains: keyword,
                    },
                },
                {
                    subject: {
                        subjectName: {
                            contains: keyword,
                        },
                    },
                },
                {
                    teacher: {
                        OR: [{
                                firstName: {
                                    contains: keyword,
                                },
                            },
                            {
                                lastName: {
                                    contains: keyword,
                                },
                            },
                        ],
                    },
                },
                {
                    academicYear: {
                        name: {
                            contains: keyword,
                        },
                    },
                },
                {
                    term: {
                        name: {
                            contains: keyword,
                        },
                    },
                },
            ],
        },
        include: {
            subject: true,
            teacher: true,
            academicYear: true,
            term: true,
            results: true,
        },
        orderBy: {
            examinationDate: "desc",
        },
    });
};

module.exports = {
    findAllExaminations,
    findExaminationById,
    findExamination,
    createExamination,
    updateExamination,
    deleteExamination,
    findSubjectById,
    findTeacherById,
    findAcademicYearById,
    findTermById,
    searchExaminations,
};