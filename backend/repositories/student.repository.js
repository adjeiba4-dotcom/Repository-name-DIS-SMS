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
    classId: true,
    status: true,
    createdAt: true,
    updatedAt: true,

    studentGuardians: {
        select: {
            id: true,
            guardianId: true,
            relationship: true,
            isPrimary: true,
            emergencyContact: true,
            guardian: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                    occupation: true,
                },
            },
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    },

    schoolClass: {
        select: {
            id: true,
            className: true,
            classCode: true,
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
 * Create a new student, optionally linking a primary guardian.
 */
exports.createStudent = async(studentData, guardianLink = null) => {
    const data = { ...studentData };

    if (guardianLink?.guardianId) {
        data.studentGuardians = {
            create: {
                guardianId: Number(guardianLink.guardianId),
                relationship: guardianLink.relationship || "GUARDIAN",
                isPrimary: true,
            },
        };
    }

    return await db.student.create({
        data,
        select: studentSelect,
    });
};

/**
 * Update an existing student. Optional guardianLink upserts the primary link.
 */
exports.updateStudent = async(id, studentData, guardianLink = null) => {
    const studentId = Number(id);

    return await db.$transaction(async (tx) => {
        const student = await tx.student.update({
            where: {
                id: studentId,
            },
            data: studentData,
            select: { id: true },
        });

        if (guardianLink?.guardianId) {
            const guardianId = Number(guardianLink.guardianId);
            const relationship = guardianLink.relationship || "GUARDIAN";

            await tx.studentGuardian.updateMany({
                where: {
                    studentId,
                    isPrimary: true,
                    NOT: { guardianId },
                },
                data: { isPrimary: false },
            });

            await tx.studentGuardian.upsert({
                where: {
                    studentId_guardianId: {
                        studentId,
                        guardianId,
                    },
                },
                create: {
                    studentId,
                    guardianId,
                    relationship,
                    isPrimary: true,
                },
                update: {
                    relationship,
                    isPrimary: true,
                },
            });
        }

        return tx.student.findFirst({
            where: { id: student.id },
            select: studentSelect,
        });
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