// repositories/teacher.repository.js

const prisma = require("../database/db");

/**
 * Fields returned for every teacher query.
 * Centralizing the selection ensures consistency.
 */
const teacherSelect = {
    id: true,
    staffNo: true,
    firstName: true,
    lastName: true,
    gender: true,
    email: true,
    phone: true,
    address: true,
    qualification: true,
    employmentDate: true,
    departmentId: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,

    department: {
        select: {
            id: true,
            name: true,
            code: true,
        },
    },

    teacherSubjects: {
        select: {
            id: true,
            subjectId: true,
        },
    },

    examinations: {
        select: {
            id: true,
            name: true,
            examinationDate: true,
        },
    },
};

class TeacherRepository {

    /**
     * Get all active teachers
     */
    async findAllTeachers() {
        return prisma.teacher.findMany({
            where: {
                deletedAt: null,
            },
            select: teacherSelect,
            orderBy: {
                staffNo: "asc",
            },
        });
    }

    /**
     * Get teacher by ID
     */
    async findTeacherById(id) {
        return prisma.teacher.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: teacherSelect,
        });
    }

    /**
     * Get archived teacher by ID
     */
    async findArchivedTeacherById(id) {
        return prisma.teacher.findFirst({
            where: {
                id,
                deletedAt: {
                    not: null,
                },
            },
            select: teacherSelect,
        });
    }

    /**
     * Find teacher by Staff Number
     */
    async findTeacherByStaffNo(staffNo) {
        return prisma.teacher.findFirst({
            where: {
                staffNo,
                deletedAt: null,
            },
            select: teacherSelect,
        });
    }

    /**
     * Find teacher by Email
     */
    async findTeacherByEmail(email) {

            if (!email) {
                return null;
            }

            return prisma.teacher.findFirst({
                where: {
                    email,
                    deletedAt: null,
                },
                select: teacherSelect,
            });
        }
        /**
         * Search teachers
         */
    async searchTeachers(keyword) {
        return prisma.teacher.findMany({
            where: {
                deletedAt: null,
                OR: [{
                        staffNo: {
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
                        email: {
                            contains: keyword,
                            mode: "insensitive",
                        },
                    },
                    {
                        department: {
                            name: {
                                contains: keyword,
                                mode: "insensitive",
                            },
                        },
                    },
                ],
            },
            select: teacherSelect,
            orderBy: {
                firstName: "asc",
            },
        });
    }

    /**
     * Create teacher
     */
    async createTeacher(data) {
        return prisma.teacher.create({
            data,
            select: teacherSelect,
        });
    }

    /**
     * Update teacher
     */
    async updateTeacher(id, data) {
        return prisma.teacher.update({
            where: {
                id,
            },
            data,
            select: teacherSelect,
        });
    }

    /**
     * Archive teacher
     */
    async softDeleteTeacher(id) {
        return prisma.teacher.update({
            where: {
                id,
            },
            data: {
                status: "ARCHIVED",
                deletedAt: new Date(),
            },
        });
    }

    /**
     * Restore teacher
     */
    async restoreTeacher(id) {
        return prisma.teacher.update({
            where: {
                id,
            },
            data: {
                status: "ACTIVE",
                deletedAt: null,
            },
            select: teacherSelect,
        });
    }

    /**
     * Get archived teachers
     */
    async findArchivedTeachers() {
        return prisma.teacher.findMany({
            where: {
                deletedAt: {
                    not: null,
                },
            },
            select: teacherSelect,
            orderBy: {
                deletedAt: "desc",
            },
        });
    }

    /**
     * Check department exists
     */
    async findDepartmentById(id) {
        return prisma.department.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
            },
        });
    }
}

module.exports = new TeacherRepository();