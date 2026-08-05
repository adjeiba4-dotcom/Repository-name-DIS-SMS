// repositories/teacherSubject.repository.js

const prisma = require("../database/db");

const teacherSelect = {
    id: true,
    staffNo: true,
    firstName: true,
    lastName: true,
    status: true,
    deletedAt: true,
    department: {
        select: {
            id: true,
            code: true,
            name: true,
        },
    },
};

const subjectSelect = {
    id: true,
    subjectCode: true,
    subjectName: true,
    shortName: true,
    category: true,
    status: true,
    deletedAt: true,
};

const academicYearSelect = {
    id: true,
    name: true,
    isCurrent: true,
    status: true,
    deletedAt: true,
};

const termSelect = {
    id: true,
    code: true,
    name: true,
    academicYearId: true,
    isCurrent: true,
    status: true,
    deletedAt: true,
};

/** Slim fields for list / search / archive directory. */
const assignmentListSelect = {
    id: true,
    teacherId: true,
    subjectId: true,
    academicYearId: true,
    termId: true,
    isPrimary: true,
    weeklyPeriods: true,
    remarks: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    teacher: { select: teacherSelect },
    subject: { select: subjectSelect },
    academicYear: { select: academicYearSelect },
    term: { select: termSelect },
};

const assignmentDetailSelect = {
    ...assignmentListSelect,
};

class TeacherSubjectRepository {
    async findTeacherSubjects({
        page = 1,
        limit = 20,
        search = "",
        teacherId = null,
        subjectId = null,
        academicYearId = null,
        termId = null,
        isPrimary = null,
        status = null,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = {}) {
        const where = {
            deletedAt: null,
        };

        if (teacherId) where.teacherId = teacherId;
        if (subjectId) where.subjectId = subjectId;
        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (isPrimary !== null && isPrimary !== undefined) {
            where.isPrimary = Boolean(isPrimary);
        }
        if (status) where.status = status;

        if (search) {
            where.OR = [
                { remarks: { contains: search } },
                { teacher: { firstName: { contains: search } } },
                { teacher: { lastName: { contains: search } } },
                { teacher: { staffNo: { contains: search } } },
                { subject: { subjectCode: { contains: search } } },
                { subject: { subjectName: { contains: search } } },
                { subject: { shortName: { contains: search } } },
                { academicYear: { name: { contains: search } } },
                { term: { name: { contains: search } } },
                { term: { code: { contains: search } } },
            ];
        }

        const allowedSort = new Set([
            "createdAt",
            "updatedAt",
            "weeklyPeriods",
            "isPrimary",
            "status",
            "teacherId",
            "subjectId",
            "academicYearId",
            "termId",
        ]);
        const orderField = allowedSort.has(sortBy) ? sortBy : "createdAt";
        const orderDir = sortOrder === "desc" ? "desc" : "asc";

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.teacherSubject.findMany({
                where,
                select: assignmentListSelect,
                orderBy: { [orderField]: orderDir },
                skip,
                take: limit,
            }),
            prisma.teacherSubject.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findTeacherSubjectById(id) {
        return prisma.teacherSubject.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: assignmentDetailSelect,
        });
    }

    async findTeacherSubjectByIdIncludingDeleted(id) {
        return prisma.teacherSubject.findFirst({
            where: { id },
            select: assignmentDetailSelect,
        });
    }

    async findAssignment({
        teacherId,
        subjectId,
        academicYearId,
        termId = null,
        excludeId = null,
    }) {
        return prisma.teacherSubject.findFirst({
            where: {
                teacherId,
                subjectId,
                academicYearId,
                termId: termId ?? null,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: {
                id: true,
                teacherId: true,
                subjectId: true,
                academicYearId: true,
                termId: true,
                deletedAt: true,
                status: true,
            },
        });
    }

    async findTeacherById(id) {
        return prisma.teacher.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: teacherSelect,
        });
    }

    async findSubjectById(id) {
        return prisma.subject.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: subjectSelect,
        });
    }

    async findAcademicYearById(id) {
        return prisma.academicYear.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: academicYearSelect,
        });
    }

    async findTermById(id) {
        return prisma.term.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: termSelect,
        });
    }

    /**
     * Archive is blocked when the assignment is in operational use via
     * timetable, examinations, or results. Attendance has no teacher/subject
     * foreign key in this schema, so it cannot reference an assignment row.
     */
    async countReferences(assignment) {
        const { teacherId, subjectId, academicYearId, termId } = assignment;

        const scoped = {
            teacherId,
            subjectId,
            academicYearId,
            ...(termId ? { termId } : {}),
        };

        const [timetables, timetableEntries, examinations, results] =
            await Promise.all([
                prisma.timetable.count({ where: scoped }),
                prisma.timetableEntry.count({
                    where: { teacherId, subjectId },
                }),
                prisma.examination.count({
                    where: {
                        ...scoped,
                        deletedAt: null,
                    },
                }),
                prisma.result.count({
                    where: {
                        subjectId,
                        ...(termId ? { termId } : {}),
                        examination: {
                            teacherId,
                            academicYearId,
                            ...(termId ? { termId } : {}),
                            deletedAt: null,
                        },
                    },
                }),
            ]);

        const attendance = 0;

        return {
            timetables: timetables + timetableEntries,
            attendance,
            examinations,
            results,
            total:
                timetables +
                timetableEntries +
                attendance +
                examinations +
                results,
        };
    }

    async createTeacherSubject(data) {
        return prisma.teacherSubject.create({
            data,
            select: assignmentDetailSelect,
        });
    }

    async updateTeacherSubject(id, data) {
        return prisma.teacherSubject.update({
            where: { id },
            data,
            select: assignmentDetailSelect,
        });
    }

    async softDeleteTeacherSubject(id) {
        return prisma.teacherSubject.update({
            where: { id },
            data: {
                status: "ARCHIVED",
                deletedAt: new Date(),
            },
            select: assignmentDetailSelect,
        });
    }

    async restoreTeacherSubject(id, { status = "INACTIVE" } = {}) {
        return prisma.teacherSubject.update({
            where: { id },
            data: {
                status,
                deletedAt: null,
            },
            select: assignmentDetailSelect,
        });
    }

    async findArchivedTeacherSubjects() {
        return prisma.teacherSubject.findMany({
            where: {
                deletedAt: { not: null },
            },
            select: assignmentListSelect,
            orderBy: [{ deletedAt: "desc" }, { createdAt: "desc" }],
        });
    }
}

module.exports = new TeacherSubjectRepository();
