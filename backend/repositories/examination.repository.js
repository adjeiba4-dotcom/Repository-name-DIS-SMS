// repositories/examination.repository.js

const prisma = require("../database/db");

const academicYearSelect = {
    id: true,
    name: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    status: true,
    deletedAt: true,
};

const termSelect = {
    id: true,
    code: true,
    name: true,
    academicYearId: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    status: true,
    deletedAt: true,
};

const schoolClassSelect = {
    id: true,
    classCode: true,
    className: true,
    academicYearId: true,
    classTeacherId: true,
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

const teacherSelect = {
    id: true,
    staffNo: true,
    firstName: true,
    lastName: true,
    status: true,
    deletedAt: true,
};

const studentSelect = {
    id: true,
    admissionNo: true,
    firstName: true,
    lastName: true,
    otherName: true,
    gender: true,
    classId: true,
    status: true,
    deletedAt: true,
};

const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
};

const scoreSelect = {
    id: true,
    examinationId: true,
    studentId: true,
    marks: true,
    remarks: true,
    createdAt: true,
    updatedAt: true,
    student: { select: studentSelect },
};

const examinationListSelect = {
    id: true,
    name: true,
    academicYearId: true,
    termId: true,
    classId: true,
    subjectId: true,
    teacherId: true,
    examinationType: true,
    maxMarks: true,
    passingMarks: true,
    examinationDate: true,
    durationMinutes: true,
    remarks: true,
    isLocked: true,
    lockedAt: true,
    lockedById: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    academicYear: { select: academicYearSelect },
    term: { select: termSelect },
    schoolClass: { select: schoolClassSelect },
    subject: { select: subjectSelect },
    teacher: { select: teacherSelect },
    lockedBy: { select: userSelect },
    _count: { select: { scores: true } },
};

const examinationDetailSelect = {
    ...examinationListSelect,
    scores: {
        select: scoreSelect,
        orderBy: [
            { student: { lastName: "asc" } },
            { student: { firstName: "asc" } },
        ],
    },
};

function toDecimalNumber(value) {
    if (value == null) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
}

function mapExamination(record) {
    if (!record) return null;
    return {
        ...record,
        maxMarks: toDecimalNumber(record.maxMarks),
        passingMarks: toDecimalNumber(record.passingMarks),
        scores: Array.isArray(record.scores)
            ? record.scores.map((score) => ({
                  ...score,
                  marks: toDecimalNumber(score.marks),
              }))
            : undefined,
        scoreCount: record._count?.scores ?? record.scores?.length ?? 0,
    };
}

class ExaminationRepository {
    async findExaminations({
        page = 1,
        limit = 20,
        search = "",
        academicYearId = null,
        termId = null,
        classId = null,
        subjectId = null,
        teacherId = null,
        examinationType = null,
        status = null,
        isLocked = null,
        dateFrom = null,
        dateTo = null,
        examinationDate = null,
        includeDeleted = false,
        onlyDeleted = false,
        sortBy = "examinationDate",
        sortOrder = "desc",
    } = {}) {
        const where = {};

        if (onlyDeleted) {
            where.deletedAt = { not: null };
        } else if (!includeDeleted) {
            where.deletedAt = null;
        }

        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (classId) where.classId = classId;
        if (subjectId) where.subjectId = subjectId;
        if (teacherId) where.teacherId = teacherId;
        if (examinationType) where.examinationType = examinationType;
        if (status) where.status = status;
        if (isLocked !== null && isLocked !== undefined) {
            where.isLocked = isLocked;
        }

        if (examinationDate) {
            where.examinationDate = examinationDate;
        } else if (dateFrom || dateTo) {
            where.examinationDate = {};
            if (dateFrom) where.examinationDate.gte = dateFrom;
            if (dateTo) where.examinationDate.lte = dateTo;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { remarks: { contains: search } },
                { schoolClass: { classCode: { contains: search } } },
                { schoolClass: { className: { contains: search } } },
                { subject: { subjectCode: { contains: search } } },
                { subject: { subjectName: { contains: search } } },
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
            "examinationDate",
            "maxMarks",
            "passingMarks",
            "examinationType",
            "status",
            "name",
            "isLocked",
        ]);
        const orderField = allowedSort.has(sortBy) ? sortBy : "examinationDate";
        const orderDir = sortOrder === "asc" ? "asc" : "desc";
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.examination.findMany({
                where,
                select: examinationListSelect,
                orderBy: [{ [orderField]: orderDir }, { id: "desc" }],
                skip,
                take: limit,
            }),
            prisma.examination.count({ where }),
        ]);

        return {
            data: data.map(mapExamination),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findExaminationById(id, { includeDeleted = false } = {}) {
        const record = await prisma.examination.findFirst({
            where: {
                id: Number(id),
                ...(includeDeleted ? {} : { deletedAt: null }),
            },
            select: examinationDetailSelect,
        });
        return mapExamination(record);
    }

    async findDuplicate({
        classId,
        subjectId,
        examinationType,
        examinationDate,
        excludeId = null,
    }) {
        return prisma.examination.findFirst({
            where: {
                classId: Number(classId),
                subjectId: Number(subjectId),
                examinationType,
                examinationDate,
                deletedAt: null,
                ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
            },
            select: { id: true, name: true, examinationType: true },
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

    async findStudentById(id) {
        return prisma.student.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: studentSelect,
        });
    }

    async findActiveClassSubject({
        schoolClassId,
        subjectId,
        academicYearId,
        termId,
    }) {
        return prisma.classSubject.findFirst({
            where: {
                schoolClassId: Number(schoolClassId),
                subjectId: Number(subjectId),
                academicYearId: Number(academicYearId),
                deletedAt: null,
                status: "ACTIVE",
                OR: [{ termId: Number(termId) }, { termId: null }],
            },
            select: {
                id: true,
                schoolClassId: true,
                subjectId: true,
                teacherSubjectId: true,
                academicYearId: true,
                termId: true,
                teacherSubject: {
                    select: {
                        id: true,
                        teacherId: true,
                        subjectId: true,
                        status: true,
                        deletedAt: true,
                    },
                },
            },
            orderBy: [{ termId: "desc" }],
        });
    }

    async findActiveTeacherSubject({
        teacherId,
        subjectId,
        academicYearId,
        termId,
    }) {
        return prisma.teacherSubject.findFirst({
            where: {
                teacherId: Number(teacherId),
                subjectId: Number(subjectId),
                academicYearId: Number(academicYearId),
                deletedAt: null,
                status: "ACTIVE",
                OR: [{ termId: Number(termId) }, { termId: null }],
            },
            select: {
                id: true,
                teacherId: true,
                subjectId: true,
                academicYearId: true,
                termId: true,
                status: true,
            },
            orderBy: [{ termId: "desc" }],
        });
    }

    async findEnrolledStudents({
        academicYearId,
        schoolClassId,
        termId = null,
    }) {
        const where = {
            academicYearId: Number(academicYearId),
            schoolClassId: Number(schoolClassId),
            deletedAt: null,
            status: "ACTIVE",
            student: {
                deletedAt: null,
                status: "ACTIVE",
            },
        };

        if (termId) {
            where.OR = [{ termId: Number(termId) }, { termId: null }];
        }

        return prisma.enrollment.findMany({
            where,
            select: {
                id: true,
                enrollmentNumber: true,
                studentId: true,
                schoolClassId: true,
                academicYearId: true,
                termId: true,
                student: { select: studentSelect },
            },
            orderBy: [
                { student: { lastName: "asc" } },
                { student: { firstName: "asc" } },
                { student: { admissionNo: "asc" } },
            ],
        });
    }

    async createExamination(data) {
        const record = await prisma.examination.create({
            data: {
                name: data.name ?? null,
                academicYearId: Number(data.academicYearId),
                termId: Number(data.termId),
                classId: Number(data.classId),
                subjectId: Number(data.subjectId),
                teacherId: Number(data.teacherId),
                examinationType: data.examinationType,
                maxMarks: data.maxMarks,
                passingMarks: data.passingMarks,
                examinationDate: data.examinationDate,
                durationMinutes: data.durationMinutes ?? null,
                remarks: data.remarks ?? null,
                status: data.status || "ACTIVE",
            },
            select: examinationDetailSelect,
        });
        return mapExamination(record);
    }

    async updateExamination(id, data) {
        const record = await prisma.examination.update({
            where: { id: Number(id) },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.academicYearId !== undefined && {
                    academicYearId: Number(data.academicYearId),
                }),
                ...(data.termId !== undefined && {
                    termId: Number(data.termId),
                }),
                ...(data.classId !== undefined && {
                    classId: Number(data.classId),
                }),
                ...(data.subjectId !== undefined && {
                    subjectId: Number(data.subjectId),
                }),
                ...(data.teacherId !== undefined && {
                    teacherId: Number(data.teacherId),
                }),
                ...(data.examinationType !== undefined && {
                    examinationType: data.examinationType,
                }),
                ...(data.maxMarks !== undefined && {
                    maxMarks: data.maxMarks,
                }),
                ...(data.passingMarks !== undefined && {
                    passingMarks: data.passingMarks,
                }),
                ...(data.examinationDate !== undefined && {
                    examinationDate: data.examinationDate,
                }),
                ...(data.durationMinutes !== undefined && {
                    durationMinutes: data.durationMinutes,
                }),
                ...(data.remarks !== undefined && { remarks: data.remarks }),
                ...(data.status !== undefined && { status: data.status }),
            },
            select: examinationDetailSelect,
        });
        return mapExamination(record);
    }

    async softDeleteExamination(id) {
        const record = await prisma.examination.update({
            where: { id: Number(id) },
            data: {
                deletedAt: new Date(),
                status: "ARCHIVED",
            },
            select: examinationListSelect,
        });
        return mapExamination(record);
    }

    async restoreExamination(id) {
        const record = await prisma.examination.update({
            where: { id: Number(id) },
            data: {
                deletedAt: null,
                status: "ACTIVE",
            },
            select: examinationDetailSelect,
        });
        return mapExamination(record);
    }

    async setLockState(id, { isLocked, userId = null }) {
        const record = await prisma.examination.update({
            where: { id: Number(id) },
            data: isLocked
                ? {
                      isLocked: true,
                      lockedAt: new Date(),
                      lockedById: userId ? Number(userId) : null,
                  }
                : {
                      isLocked: false,
                      lockedAt: null,
                      lockedById: null,
                  },
            select: examinationDetailSelect,
        });
        return mapExamination(record);
    }

    async upsertScore({ examinationId, studentId, marks, remarks }) {
        const record = await prisma.examinationScore.upsert({
            where: {
                examinationId_studentId: {
                    examinationId: Number(examinationId),
                    studentId: Number(studentId),
                },
            },
            create: {
                examinationId: Number(examinationId),
                studentId: Number(studentId),
                marks,
                remarks: remarks ?? null,
            },
            update: {
                marks,
                remarks: remarks ?? null,
            },
            select: scoreSelect,
        });

        return {
            ...record,
            marks: toDecimalNumber(record.marks),
        };
    }

    async deleteScore(examinationId, studentId) {
        return prisma.examinationScore.deleteMany({
            where: {
                examinationId: Number(examinationId),
                studentId: Number(studentId),
            },
        });
    }

    async deleteScoresForExamination(examinationId) {
        return prisma.examinationScore.deleteMany({
            where: { examinationId: Number(examinationId) },
        });
    }

    analyticsWhere({
        academicYearId = null,
        termId = null,
        classId = null,
        subjectId = null,
        teacherId = null,
        examinationType = null,
        dateFrom = null,
        dateTo = null,
    } = {}) {
        const where = {
            deletedAt: null,
            status: { not: "ARCHIVED" },
        };

        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (classId) where.classId = classId;
        if (subjectId) where.subjectId = subjectId;
        if (teacherId) where.teacherId = teacherId;
        if (examinationType) where.examinationType = examinationType;

        if (dateFrom || dateTo) {
            where.examinationDate = {};
            if (dateFrom) where.examinationDate.gte = dateFrom;
            if (dateTo) where.examinationDate.lte = dateTo;
        }

        return where;
    }

    async getScoreStats(filters = {}) {
        const examinationWhere = this.analyticsWhere(filters);

        const [examinationCount, scoreAgg, byType] = await Promise.all([
            prisma.examination.count({ where: examinationWhere }),
            prisma.examinationScore.aggregate({
                where: { examination: examinationWhere },
                _avg: { marks: true },
                _min: { marks: true },
                _max: { marks: true },
                _count: { _all: true },
            }),
            prisma.examination.groupBy({
                by: ["examinationType"],
                where: examinationWhere,
                _count: { _all: true },
            }),
        ]);

        return {
            examinationCount,
            scoreCount: scoreAgg._count._all || 0,
            averageMarks: toDecimalNumber(scoreAgg._avg.marks) ?? 0,
            minMarks: toDecimalNumber(scoreAgg._min.marks),
            maxMarksRecorded: toDecimalNumber(scoreAgg._max.marks),
            byType: byType.map((row) => ({
                examinationType: row.examinationType,
                count: row._count._all,
            })),
        };
    }

    async getExaminationsForAnalytics(filters = {}) {
        const records = await prisma.examination.findMany({
            where: this.analyticsWhere(filters),
            select: {
                id: true,
                name: true,
                classId: true,
                subjectId: true,
                teacherId: true,
                examinationType: true,
                maxMarks: true,
                passingMarks: true,
                examinationDate: true,
                schoolClass: {
                    select: {
                        id: true,
                        classCode: true,
                        className: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        subjectCode: true,
                        subjectName: true,
                    },
                },
                teacher: {
                    select: {
                        id: true,
                        staffNo: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                scores: {
                    select: {
                        id: true,
                        studentId: true,
                        marks: true,
                    },
                },
            },
            orderBy: [{ examinationDate: "asc" }, { id: "asc" }],
        });

        return records.map((record) => ({
            ...record,
            maxMarks: toDecimalNumber(record.maxMarks),
            passingMarks: toDecimalNumber(record.passingMarks),
            scores: record.scores.map((score) => ({
                ...score,
                marks: toDecimalNumber(score.marks),
            })),
        }));
    }
}

module.exports = new ExaminationRepository();
