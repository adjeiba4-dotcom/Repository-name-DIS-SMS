// repositories/classSubject.repository.js

const prisma = require("../database/db");

const schoolClassSelect = {
    id: true,
    classCode: true,
    className: true,
    academicYearId: true,
    status: true,
    deletedAt: true,
};

const teacherSelect = {
    id: true,
    staffNo: true,
    firstName: true,
    lastName: true,
    status: true,
    deletedAt: true,
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

const teacherSubjectSelect = {
    id: true,
    teacherId: true,
    subjectId: true,
    academicYearId: true,
    termId: true,
    isPrimary: true,
    weeklyPeriods: true,
    status: true,
    deletedAt: true,
    teacher: { select: teacherSelect },
    subject: { select: subjectSelect },
    academicYear: { select: academicYearSelect },
};

/** Slim fields for list / search / archive directory. */
const allocationListSelect = {
    id: true,
    schoolClassId: true,
    teacherSubjectId: true,
    subjectId: true,
    academicYearId: true,
    termId: true,
    weeklyPeriods: true,
    isCompulsory: true,
    displayOrder: true,
    remarks: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    schoolClass: { select: schoolClassSelect },
    teacherSubject: { select: teacherSubjectSelect },
    subject: { select: subjectSelect },
    academicYear: { select: academicYearSelect },
    term: { select: termSelect },
};

const allocationDetailSelect = {
    ...allocationListSelect,
};

class ClassSubjectRepository {
    async findClassSubjects({
        page = 1,
        limit = 20,
        search = "",
        schoolClassId = null,
        teacherSubjectId = null,
        subjectId = null,
        academicYearId = null,
        termId = null,
        isCompulsory = null,
        status = null,
        sortBy = "displayOrder",
        sortOrder = "asc",
    } = {}) {
        const where = {
            deletedAt: null,
        };

        if (schoolClassId) where.schoolClassId = schoolClassId;
        if (teacherSubjectId) where.teacherSubjectId = teacherSubjectId;
        if (subjectId) where.subjectId = subjectId;
        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (isCompulsory !== null && isCompulsory !== undefined) {
            where.isCompulsory = Boolean(isCompulsory);
        }
        if (status) where.status = status;

        if (search) {
            where.OR = [
                { remarks: { contains: search } },
                { schoolClass: { classCode: { contains: search } } },
                { schoolClass: { className: { contains: search } } },
                { subject: { subjectCode: { contains: search } } },
                { subject: { subjectName: { contains: search } } },
                { subject: { shortName: { contains: search } } },
                {
                    teacherSubject: {
                        teacher: { firstName: { contains: search } },
                    },
                },
                {
                    teacherSubject: {
                        teacher: { lastName: { contains: search } },
                    },
                },
                {
                    teacherSubject: {
                        teacher: { staffNo: { contains: search } },
                    },
                },
                { academicYear: { name: { contains: search } } },
                { term: { name: { contains: search } } },
                { term: { code: { contains: search } } },
            ];
        }

        const allowedSort = new Set([
            "createdAt",
            "updatedAt",
            "weeklyPeriods",
            "isCompulsory",
            "displayOrder",
            "status",
            "schoolClassId",
            "subjectId",
            "academicYearId",
            "termId",
            "teacherSubjectId",
        ]);
        const orderField = allowedSort.has(sortBy) ? sortBy : "displayOrder";
        const orderDir = sortOrder === "desc" ? "desc" : "asc";

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.classSubject.findMany({
                where,
                select: allocationListSelect,
                orderBy: [{ [orderField]: orderDir }, { id: "asc" }],
                skip,
                take: limit,
            }),
            prisma.classSubject.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findClassSubjectById(id) {
        return prisma.classSubject.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: allocationDetailSelect,
        });
    }

    async findClassSubjectByIdIncludingDeleted(id) {
        return prisma.classSubject.findFirst({
            where: { id },
            select: allocationDetailSelect,
        });
    }

    async findAllocation({
        schoolClassId,
        subjectId,
        academicYearId,
        termId = null,
        excludeId = null,
    }) {
        return prisma.classSubject.findFirst({
            where: {
                schoolClassId,
                subjectId,
                academicYearId,
                termId: termId ?? null,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: {
                id: true,
                schoolClassId: true,
                subjectId: true,
                academicYearId: true,
                termId: true,
                deletedAt: true,
                status: true,
            },
        });
    }

    async findSchoolClassById(id) {
        return prisma.schoolClass.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: schoolClassSelect,
        });
    }

    async findTeacherSubjectById(id) {
        return prisma.teacherSubject.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: teacherSubjectSelect,
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
     * Archive is blocked when the allocation is in operational use via
     * timetable, examinations, or results. Assessment has no model in this
     * schema, so it cannot reference an allocation row.
     */
    async countReferences(allocation) {
        const { schoolClassId, subjectId, academicYearId, termId } = allocation;

        const timetableWhere = {
            classId: schoolClassId,
            subjectId,
            academicYearId,
            ...(termId ? { termId } : {}),
        };

        const [timetables, examinations, results] = await Promise.all([
            prisma.timetable.count({ where: timetableWhere }),
            prisma.examination.count({
                where: {
                    subjectId,
                    academicYearId,
                    ...(termId ? { termId } : {}),
                    deletedAt: null,
                },
            }),
            prisma.result.count({
                where: {
                    subjectId,
                    ...(termId ? { termId } : {}),
                    examination: {
                        academicYearId,
                        ...(termId ? { termId } : {}),
                        deletedAt: null,
                    },
                },
            }),
        ]);

        const assessments = 0;

        return {
            timetables,
            assessments,
            examinations,
            results,
            total: timetables + assessments + examinations + results,
        };
    }

    async createClassSubject(data) {
        return prisma.classSubject.create({
            data,
            select: allocationDetailSelect,
        });
    }

    async updateClassSubject(id, data) {
        return prisma.classSubject.update({
            where: { id },
            data,
            select: allocationDetailSelect,
        });
    }

    async softDeleteClassSubject(id) {
        return prisma.classSubject.update({
            where: { id },
            data: {
                status: "ARCHIVED",
                deletedAt: new Date(),
            },
            select: allocationDetailSelect,
        });
    }

    async restoreClassSubject(id, { status = "INACTIVE" } = {}) {
        return prisma.classSubject.update({
            where: { id },
            data: {
                status,
                deletedAt: null,
            },
            select: allocationDetailSelect,
        });
    }

    async findArchivedClassSubjects() {
        return prisma.classSubject.findMany({
            where: {
                deletedAt: { not: null },
            },
            select: allocationListSelect,
            orderBy: [{ deletedAt: "desc" }, { createdAt: "desc" }],
        });
    }
}

module.exports = new ClassSubjectRepository();
