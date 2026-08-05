// repositories/timetable.repository.js

const prisma = require("../database/db");

/**
 * Common include for timetable queries
 */
const timetableInclude = {
    academicYear: true,
    term: true,
    schoolClass: true,
    subject: true,
    teacher: true,
};

/**
 * Get all timetable entries
 */
const findAllTimetables = async() => {
    return await prisma.timetable.findMany({
        include: timetableInclude,
        orderBy: [{
                dayOfWeek: "asc",
            },
            {
                startTime: "asc",
            },
        ],
    });
};

/**
 * Get timetable by ID
 */
const findTimetableById = async(id) => {
    return await prisma.timetable.findUnique({
        where: {
            id: Number(id),
        },
        include: timetableInclude,
    });
};

/**
 * Find duplicate timetable
 */
const findTimetable = async(
    academicYearId,
    termId,
    classId,
    dayOfWeek,
    startTime
) => {
    return await prisma.timetable.findFirst({
        where: {
            academicYearId: Number(academicYearId),
            termId: Number(termId),
            classId: Number(classId),
            dayOfWeek,
            startTime,
        },
    });
};

/**
 * Academic Year lookup
 */
const findAcademicYearById = async(id) => {
    return await prisma.academicYear.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Term lookup
 */
const findTermById = async(id) => {
    return await prisma.term.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Class lookup
 */
const findSchoolClassById = async(id) => {
    return await prisma.schoolClass.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Subject lookup
 */
const findSubjectById = async(id) => {
    return await prisma.subject.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Teacher lookup
 */
const findTeacherById = async(id) => {
    return await prisma.teacher.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Search timetable
 */
const searchTimetables = async(keyword) => {
    return await prisma.timetable.findMany({
        where: {
            OR: [{
                    dayOfWeek: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    subject: {
                        subjectName: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    teacher: {
                        firstName: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    teacher: {
                        lastName: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    schoolClass: {
                        name: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
            ],
        },
        include: timetableInclude,
        orderBy: [{
                dayOfWeek: "asc",
            },
            {
                startTime: "asc",
            },
        ],
    });
};

/**
 * Create timetable
 */
const createTimetable = async(data) => {
    return await prisma.timetable.create({
        data,
        include: timetableInclude,
    });
};

/**
 * Update timetable
 */
const updateTimetable = async(
    id,
    data
) => {
    return await prisma.timetable.update({
        where: {
            id: Number(id),
        },
        data,
        include: timetableInclude,
    });
};

/**
 * Delete timetable
 */
const deleteTimetable = async(id) => {
    return await prisma.timetable.delete({
        where: {
            id: Number(id),
        },
    });
};

module.exports = {
    findAllTimetables,
    findTimetableById,
    findTimetable,
    findAcademicYearById,
    findTermById,
    findSchoolClassById,
    findSubjectById,
    findTeacherById,
    searchTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable,
};