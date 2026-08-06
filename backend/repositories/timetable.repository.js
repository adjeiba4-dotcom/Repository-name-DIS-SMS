// repositories/timetable.repository.js

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

const timetableListSelect = {
    id: true,
    academicYearId: true,
    termId: true,
    classId: true,
    subjectId: true,
    teacherId: true,
    dayOfWeek: true,
    startTime: true,
    endTime: true,
    room: true,
    remarks: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    academicYear: { select: academicYearSelect },
    term: { select: termSelect },
    schoolClass: { select: schoolClassSelect },
    subject: { select: subjectSelect },
    teacher: { select: teacherSelect },
};

const timetableDetailSelect = {
    ...timetableListSelect,
};

class TimetableRepository {
    async findTimetables({
        page = 1,
        limit = 20,
        search = "",
        academicYearId = null,
        termId = null,
        classId = null,
        teacherId = null,
        subjectId = null,
        dayOfWeek = null,
        status = null,
        sortBy = "dayOfWeek",
        sortOrder = "asc",
    } = {}) {
        const where = {};

        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (classId) where.classId = classId;
        if (teacherId) where.teacherId = teacherId;
        if (subjectId) where.subjectId = subjectId;
        if (dayOfWeek) where.dayOfWeek = dayOfWeek;
        if (status) where.status = status;

        if (search) {
            where.OR = [
                { dayOfWeek: { contains: search } },
                { room: { contains: search } },
                { remarks: { contains: search } },
                { startTime: { contains: search } },
                { endTime: { contains: search } },
                { schoolClass: { classCode: { contains: search } } },
                { schoolClass: { className: { contains: search } } },
                { subject: { subjectCode: { contains: search } } },
                { subject: { subjectName: { contains: search } } },
                { subject: { shortName: { contains: search } } },
                { teacher: { firstName: { contains: search } } },
                { teacher: { lastName: { contains: search } } },
                { teacher: { staffNo: { contains: search } } },
                { academicYear: { name: { contains: search } } },
                { term: { name: { contains: search } } },
                { term: { code: { contains: search } } },
            ];
        }

        const allowedSort = new Set([
            "createdAt",
            "updatedAt",
            "dayOfWeek",
            "startTime",
            "endTime",
            "status",
            "academicYearId",
            "termId",
            "classId",
            "subjectId",
            "teacherId",
            "room",
        ]);
        const orderField = allowedSort.has(sortBy) ? sortBy : "dayOfWeek";
        const orderDir = sortOrder === "desc" ? "desc" : "asc";

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.timetable.findMany({
                where,
                select: timetableListSelect,
                orderBy: [
                    { [orderField]: orderDir },
                    { startTime: "asc" },
                    { id: "asc" },
                ],
                skip,
                take: limit,
            }),
            prisma.timetable.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    /**
     * Unpaginated fetch for grid / view workspaces.
     */
    async findTimetableEntries({
        academicYearId = null,
        termId = null,
        classId = null,
        teacherId = null,
        subjectId = null,
        dayOfWeek = null,
        status = null,
    } = {}) {
        const where = {};

        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (classId) where.classId = classId;
        if (teacherId) where.teacherId = teacherId;
        if (subjectId) where.subjectId = subjectId;
        if (dayOfWeek) where.dayOfWeek = dayOfWeek;
        if (status) where.status = status;

        return prisma.timetable.findMany({
            where,
            select: timetableListSelect,
            orderBy: [
                { dayOfWeek: "asc" },
                { startTime: "asc" },
                { id: "asc" },
            ],
        });
    }

    async findTimetableById(id) {
        return prisma.timetable.findUnique({
            where: { id: Number(id) },
            select: timetableDetailSelect,
        });
    }

    async findExactSlot({
        academicYearId,
        termId,
        classId,
        dayOfWeek,
        startTime,
        excludeId = null,
    }) {
        return prisma.timetable.findFirst({
            where: {
                academicYearId,
                termId,
                classId,
                dayOfWeek,
                startTime,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: { id: true, status: true },
        });
    }

    /**
     * Candidates for overlap clash checks (same day + scope).
     * Overlap math is applied in the service layer.
     */
    async findPotentialClashes({
        academicYearId,
        termId,
        dayOfWeek,
        classId = null,
        teacherId = null,
        room = null,
        excludeId = null,
    }) {
        const or = [];
        if (classId) or.push({ classId });
        if (teacherId) or.push({ teacherId });
        if (room) or.push({ room });

        if (!or.length) return [];

        return prisma.timetable.findMany({
            where: {
                academicYearId,
                termId,
                dayOfWeek,
                status: { not: "ARCHIVED" },
                OR: or,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: {
                id: true,
                classId: true,
                teacherId: true,
                subjectId: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                room: true,
                schoolClass: { select: schoolClassSelect },
                teacher: { select: teacherSelect },
                subject: { select: subjectSelect },
            },
        });
    }

    async countScheduledPeriods({
        academicYearId,
        termId,
        classId,
        subjectId,
        excludeId = null,
    }) {
        return prisma.timetable.count({
            where: {
                academicYearId,
                termId,
                classId,
                subjectId,
                status: { not: "ARCHIVED" },
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
        });
    }

    async findAcademicYearById(id) {
        return prisma.academicYear.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: academicYearSelect,
        });
    }

    async findTermById(id) {
        return prisma.term.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: termSelect,
        });
    }

    async findSchoolClassById(id) {
        return prisma.schoolClass.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: schoolClassSelect,
        });
    }

    async findSubjectById(id) {
        return prisma.subject.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: subjectSelect,
        });
    }

    async findTeacherById(id) {
        return prisma.teacher.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: teacherSelect,
        });
    }

    /**
     * Active class-subject allocation for class + subject + year,
     * matching the term or a year-wide (null term) allocation.
     */
    async findActiveClassSubject({
        schoolClassId,
        subjectId,
        academicYearId,
        termId,
    }) {
        return prisma.classSubject.findFirst({
            where: {
                schoolClassId,
                subjectId,
                academicYearId,
                deletedAt: null,
                status: "ACTIVE",
                OR: [{ termId }, { termId: null }],
            },
            select: {
                id: true,
                schoolClassId: true,
                teacherSubjectId: true,
                subjectId: true,
                academicYearId: true,
                termId: true,
                weeklyPeriods: true,
                status: true,
                teacherSubject: {
                    select: {
                        id: true,
                        teacherId: true,
                        subjectId: true,
                        academicYearId: true,
                        termId: true,
                        weeklyPeriods: true,
                        status: true,
                        deletedAt: true,
                        teacher: { select: teacherSelect },
                    },
                },
            },
            orderBy: [{ termId: "desc" }],
        });
    }

    /**
     * Active teacher-subject assignment for teacher + subject + year,
     * matching the term or a year-wide (null term) assignment.
     */
    async findActiveTeacherSubject({
        teacherId,
        subjectId,
        academicYearId,
        termId,
    }) {
        return prisma.teacherSubject.findFirst({
            where: {
                teacherId,
                subjectId,
                academicYearId,
                deletedAt: null,
                status: "ACTIVE",
                OR: [{ termId }, { termId: null }],
            },
            select: {
                id: true,
                teacherId: true,
                subjectId: true,
                academicYearId: true,
                termId: true,
                weeklyPeriods: true,
                status: true,
            },
            orderBy: [{ termId: "desc" }],
        });
    }

    async createTimetable(data) {
        return prisma.timetable.create({
            data,
            select: timetableDetailSelect,
        });
    }

    async updateTimetable(id, data) {
        return prisma.timetable.update({
            where: { id: Number(id) },
            data,
            select: timetableDetailSelect,
        });
    }

    async deleteTimetable(id) {
        return prisma.timetable.delete({
            where: { id: Number(id) },
        });
    }
}

module.exports = new TimetableRepository();
