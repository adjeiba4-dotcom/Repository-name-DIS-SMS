// repositories/class.repository.js

const prisma = require("../database/db");

/** Slim fields for list / search / archive directory. */
const classListSelect = {
    id: true,
    classCode: true,
    className: true,
    academicYearId: true,
    departmentId: true,
    classTeacherId: true,
    capacity: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    academicYear: {
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
            isCurrent: true,
        },
    },
    department: {
        select: {
            id: true,
            code: true,
            name: true,
            status: true,
        },
    },
    classTeacher: {
        select: {
            id: true,
            staffNo: true,
            firstName: true,
            lastName: true,
            status: true,
        },
    },
    _count: {
        select: {
            students: true,
            enrollments: true,
            subjects: true,
            feeStructures: true,
            timetables: true,
        },
    },
};

/** Full detail for profile / edit. */
const classDetailSelect = {
    ...classListSelect,
};

class ClassRepository {
    async findClasses({
        page = 1,
        limit = 20,
        search = "",
        academicYearId = null,
        departmentId = null,
        status = null,
        sortBy = "className",
        sortOrder = "asc",
    } = {}) {
        const where = {
            deletedAt: null,
        };

        if (academicYearId) {
            where.academicYearId = academicYearId;
        }

        if (departmentId) {
            where.departmentId = departmentId;
        }

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { classCode: { contains: search } },
                { className: { contains: search } },
                { description: { contains: search } },
                { academicYear: { name: { contains: search } } },
                { department: { name: { contains: search } } },
                { department: { code: { contains: search } } },
            ];
        }

        const allowedSort = new Set([
            "className",
            "classCode",
            "capacity",
            "status",
            "createdAt",
            "updatedAt",
        ]);
        const orderField = allowedSort.has(sortBy) ? sortBy : "className";
        const orderDir = sortOrder === "desc" ? "desc" : "asc";

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.schoolClass.findMany({
                where,
                select: classListSelect,
                orderBy: [
                    { academicYear: { startDate: "desc" } },
                    { [orderField]: orderDir },
                ],
                skip,
                take: limit,
            }),
            prisma.schoolClass.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findClassById(id) {
        return prisma.schoolClass.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: classDetailSelect,
        });
    }

    async findClassByIdIncludingDeleted(id) {
        return prisma.schoolClass.findFirst({
            where: { id },
            select: classDetailSelect,
        });
    }

    async findClassByCode(academicYearId, classCode, { excludeId = null } = {}) {
        if (!classCode) return null;

        return prisma.schoolClass.findFirst({
            where: {
                academicYearId,
                classCode,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: {
                id: true,
                classCode: true,
                className: true,
                deletedAt: true,
                status: true,
            },
        });
    }

    async findAcademicYearById(id) {
        return prisma.academicYear.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                status: true,
                isCurrent: true,
                deletedAt: true,
            },
        });
    }

    async findDepartmentById(id) {
        return prisma.department.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                code: true,
                name: true,
                status: true,
                deletedAt: true,
            },
        });
    }

    async findTeacherById(id) {
        return prisma.teacher.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                staffNo: true,
                firstName: true,
                lastName: true,
                status: true,
                deletedAt: true,
            },
        });
    }

    async countEnrolledStudents(id) {
        const [students, enrollments] = await Promise.all([
            prisma.student.count({
                where: {
                    classId: id,
                    deletedAt: null,
                },
            }),
            prisma.enrollment.count({
                where: {
                    classId: id,
                    status: "ACTIVE",
                },
            }),
        ]);

        return {
            students,
            enrollments,
            total: students + enrollments,
        };
    }

    async createClass(data) {
        return prisma.schoolClass.create({
            data,
            select: classDetailSelect,
        });
    }

    async updateClass(id, data) {
        return prisma.schoolClass.update({
            where: { id },
            data,
            select: classDetailSelect,
        });
    }

    async softDeleteClass(id) {
        return prisma.schoolClass.update({
            where: { id },
            data: {
                status: "ARCHIVED",
                deletedAt: new Date(),
            },
            select: classDetailSelect,
        });
    }

    async restoreClass(id, { status = "INACTIVE" } = {}) {
        return prisma.schoolClass.update({
            where: { id },
            data: {
                status,
                deletedAt: null,
            },
            select: classDetailSelect,
        });
    }

    async findArchivedClasses() {
        return prisma.schoolClass.findMany({
            where: {
                deletedAt: { not: null },
            },
            select: classListSelect,
            orderBy: [{ deletedAt: "desc" }, { className: "asc" }],
        });
    }
}

module.exports = new ClassRepository();
