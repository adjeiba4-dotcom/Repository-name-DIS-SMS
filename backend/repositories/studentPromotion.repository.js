// repositories/studentPromotion.repository.js

const prisma = require("../database/db");

/**
 * Common include for Student Promotion
 */
const promotionInclude = {
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
    fromClass: true,
    toClass: true,
    academicYear: true,
    promotedByUser: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
};

/**
 * Get all promotions
 */
const findAllStudentPromotions = async() => {
    return await prisma.studentPromotion.findMany({
        include: promotionInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Get promotion by ID
 */
const findStudentPromotionById = async(id) => {
    return await prisma.studentPromotion.findUnique({
        where: {
            id: Number(id),
        },
        include: promotionInclude,
    });
};

/**
 * Find duplicate promotion
 */
const findStudentPromotion = async(
    studentId,
    academicYearId
) => {
    return await prisma.studentPromotion.findFirst({
        where: {
            studentId: Number(studentId),
            academicYearId: Number(academicYearId),
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
 * Class lookup
 */
const findSchoolClassById = async(classId) => {
    return await prisma.schoolClass.findUnique({
        where: {
            id: Number(classId),
        },
    });
};

/**
 * Academic Year lookup
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
 * User lookup
 */
const findUserById = async(userId) => {
    return await prisma.user.findUnique({
        where: {
            id: Number(userId),
        },
    });
};

/**
 * Search promotions
 */
const searchStudentPromotions = async(
    keyword
) => {
    return await prisma.studentPromotion.findMany({
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
                    fromClass: {
                        name: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    toClass: {
                        name: {
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
            ],
        },
        include: promotionInclude,
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Create promotion
 */
const createStudentPromotion = async(
    data
) => {
    return await prisma.studentPromotion.create({
        data,
        include: promotionInclude,
    });
};

/**
 * Update promotion
 */
const updateStudentPromotion = async(
    id,
    data
) => {
    return await prisma.studentPromotion.update({
        where: {
            id: Number(id),
        },
        data,
        include: promotionInclude,
    });
};

/**
 * Delete promotion
 */
const deleteStudentPromotion = async(
    id
) => {
    return await prisma.studentPromotion.delete({
        where: {
            id: Number(id),
        },
    });
};

module.exports = {
    findAllStudentPromotions,
    findStudentPromotionById,
    findStudentPromotion,
    findStudentById,
    findSchoolClassById,
    findAcademicYearById,
    findUserById,
    searchStudentPromotions,
    createStudentPromotion,
    updateStudentPromotion,
    deleteStudentPromotion,
};