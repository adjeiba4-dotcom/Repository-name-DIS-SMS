const db = require("../database/db");

/**
 * Fields returned for every student query.
 * Centralizing the selection ensures consistency across the application.
 */
const studentSelect = {
    id: true,
    admissionNo: true,
    firstName: true,
    lastName: true,
    otherName: true,
    gender: true,
    dateOfBirth: true,
    admissionDate: true,
    email: true,
    phone: true,
    address: true,
    guardianId: true,
    classId: true,
    status: true,
    createdAt: true,
    updatedAt: true,

    guardian: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            occupation: true,
            relationship: true,
        },
    },

    schoolClass: {
        select: {
            id: true,
            name: true,
            code: true,
        },
    },
};

/**
 * Get all active students
 */
exports.findAllStudents = async() => {
    return await db.student.findMany({
        where: {
            deletedAt: null,
        },
        select: studentSelect,
        orderBy: [{
                lastName: "asc",
            },
            {
                firstName: "asc",
            },
        ],
    });
};

/**
 * Get student by ID
 */
exports.findStudentById = async(id) => {
    return await db.student.findFirst({
        where: {
            id: Number(id),
            deletedAt: null,
        },
        select: studentSelect,
    });
};

/**
 * Get archived student by ID
 */
exports.findArchivedStudentById = async(id) => {
    return await db.student.findFirst({
        where: {
            id: Number(id),
            deletedAt: {
                not: null,
            },
        },
        select: studentSelect,
    });
};

/**
 * Find student using admission number
 */
exports.findStudentByAdmissionNo = async(admissionNo) => {
    return await db.student.findFirst({
        where: {
            admissionNo,
            deletedAt: null,
        },
        select: studentSelect,
    });
};

/**
 * Search students
 */
exports.searchStudents = async(keyword) => {
    return await db.student.findMany({
        where: {
            deletedAt: null,
            OR: [{
                    admissionNo: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
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
                    otherName: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
            ],
        },
        select: studentSelect,
        orderBy: [{
                lastName: "asc",
            },
            {
                firstName: "asc",
            },
        ],
    });
};

/**
 * Check if guardian exists
 */
exports.guardianExists = async(guardianId) => {
    return await db.guardian.findUnique({
        where: {
            id: Number(guardianId),
        },
        select: {
            id: true,
        },
    });
};

/**
 * Check if class exists
 */
exports.classExists = async(classId) => {
    return await db.schoolClass.findUnique({
        where: {
            id: Number(classId),
        },
        select: {
            id: true,
        },
    });
};

/**
 * Create a new student
 */
exports.createStudent = async(studentData) => {
    return await db.student.create({
        data: studentData,
        select: studentSelect,
    });
};

/**
 * Update an existing student
 */
exports.updateStudent = async(id, studentData) => {
    return await db.student.update({
        where: {
            id: Number(id),
        },
        data: studentData,
        select: studentSelect,
    });
};

/**
 * Archive (Soft Delete) a student
 */
exports.softDeleteStudent = async(id) => {
    return await db.student.update({
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
 * Restore an archived student
 */
exports.restoreStudent = async(id) => {
    return await db.student.update({
        where: {
            id: Number(id),
        },
        data: {
            status: "ACTIVE",
            deletedAt: null,
        },
        select: studentSelect,
    });
};

/**
 * Get archived students
 */
exports.findArchivedStudents = async() => {
    return await db.student.findMany({
        where: {
            deletedAt: {
                not: null,
            },
        },
        select: studentSelect,
        orderBy: [{
            updatedAt: "desc",
        }, ],
    });
};