// repositories/subject.repository.js

const prisma = require("../database/db");

/** Slim fields for list / search / archive directory. */
const subjectListSelect = {
    id: true,
    subjectCode: true,
    subjectName: true,
    shortName: true,
    departmentId: true,
    schoolClassId: true,
    category: true,
    creditHours: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    department: {
        select: {
            id: true,
            code: true,
            name: true,
            status: true,
        },
    },
    schoolClass: {
        select: {
            id: true,
            classCode: true,
            className: true,
            status: true,
        },
    },
    _count: {
        select: {
            teacherSubjects: true,
            examinations: true,
            results: true,
            timetables: true,
            timetableEntries: true,
        },
    },
};

/** Full detail for profile / edit. */
const subjectDetailSelect = {
    ...subjectListSelect,
};

class SubjectRepository {
    async findSubjects({
        page = 1,
        limit = 20,
        search = "",
        departmentId = null,
        schoolClassId = null,
        category = null,
        status = null,
        sortBy = "subjectName",
        sortOrder = "asc",
    } = {}) {
        const where = {
            deletedAt: null,
        };

        if (departmentId) {
            where.departmentId = departmentId;
        }

        if (schoolClassId) {
            where.schoolClassId = schoolClassId;
        }

        if (category) {
            where.category = category;
        }

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { subjectCode: { contains: search } },
                { subjectName: { contains: search } },
                { shortName: { contains: search } },
                { description: { contains: search } },
                { department: { name: { contains: search } } },
                { department: { code: { contains: search } } },
                { schoolClass: { className: { contains: search } } },
                { schoolClass: { classCode: { contains: search } } },
            ];
        }

        const allowedSort = new Set([
            "subjectName",
            "subjectCode",
            "shortName",
            "category",
            "creditHours",
            "status",
            "createdAt",
            "updatedAt",
        ]);
        const orderField = allowedSort.has(sortBy) ? sortBy : "subjectName";
        const orderDir = sortOrder === "desc" ? "desc" : "asc";

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.subject.findMany({
                where,
                select: subjectListSelect,
                orderBy: { [orderField]: orderDir },
                skip,
                take: limit,
            }),
            prisma.subject.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findSubjectById(id) {
        return prisma.subject.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: subjectDetailSelect,
        });
    }

    async findSubjectByIdIncludingDeleted(id) {
        return prisma.subject.findFirst({
            where: { id },
            select: subjectDetailSelect,
        });
    }

    async findSubjectByCode(subjectCode, { excludeId = null } = {}) {
        if (!subjectCode) return null;

        return prisma.subject.findFirst({
            where: {
                subjectCode,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: {
                id: true,
                subjectCode: true,
                subjectName: true,
                deletedAt: true,
                status: true,
            },
        });
    }

    async findSubjectByName(subjectName, { excludeId = null } = {}) {
        if (!subjectName) return null;

        return prisma.subject.findFirst({
            where: {
                subjectName,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: {
                id: true,
                subjectCode: true,
                subjectName: true,
                deletedAt: true,
                status: true,
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

    async findSchoolClassById(id) {
        return prisma.schoolClass.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: {
                id: true,
                classCode: true,
                className: true,
                status: true,
                deletedAt: true,
            },
        });
    }

    async countReferences(id) {
        const [teacherAssignments, examinations, subject] = await Promise.all([
            prisma.teacherSubject.count({
                where: { subjectId: id },
            }),
            prisma.examination.count({
                where: { subjectId: id },
            }),
            prisma.subject.findFirst({
                where: { id },
                select: { schoolClassId: true },
            }),
        ]);

        const classAssignments = subject?.schoolClassId ? 1 : 0;

        return {
            teacherAssignments,
            classAssignments,
            examinations,
            total: teacherAssignments + classAssignments + examinations,
        };
    }

    async createSubject(data) {
        return prisma.subject.create({
            data,
            select: subjectDetailSelect,
        });
    }

    async updateSubject(id, data) {
        return prisma.subject.update({
            where: { id },
            data,
            select: subjectDetailSelect,
        });
    }

    async softDeleteSubject(id) {
        return prisma.subject.update({
            where: { id },
            data: {
                status: "ARCHIVED",
                deletedAt: new Date(),
            },
            select: subjectDetailSelect,
        });
    }

    async restoreSubject(id, { status = "INACTIVE" } = {}) {
        return prisma.subject.update({
            where: { id },
            data: {
                status,
                deletedAt: null,
            },
            select: subjectDetailSelect,
        });
    }

    async findArchivedSubjects() {
        return prisma.subject.findMany({
            where: {
                deletedAt: { not: null },
            },
            select: subjectListSelect,
            orderBy: [{ deletedAt: "desc" }, { subjectName: "asc" }],
        });
    }
}

module.exports = new SubjectRepository();
