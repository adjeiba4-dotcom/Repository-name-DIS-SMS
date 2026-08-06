// repositories/assessment.repository.js

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

const scoreSelect = {
    id: true,
    assessmentId: true,
    studentId: true,
    marks: true,
    remarks: true,
    createdAt: true,
    updatedAt: true,
    student: { select: studentSelect },
};

const assessmentListSelect = {
    id: true,
    title: true,
    academicYearId: true,
    termId: true,
    classId: true,
    subjectId: true,
    teacherId: true,
    assessmentType: true,
    maxMarks: true,
    assessmentDate: true,
    remarks: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    academicYear: { select: academicYearSelect },
    term: { select: termSelect },
    schoolClass: { select: schoolClassSelect },
    subject: { select: subjectSelect },
    teacher: { select: teacherSelect },
    _count: { select: { scores: true } },
};

const assessmentDetailSelect = {
    ...assessmentListSelect,
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

function mapAssessment(record) {
    if (!record) return null;
    return {
        ...record,
        maxMarks: toDecimalNumber(record.maxMarks),
        scores: Array.isArray(record.scores)
            ? record.scores.map((score) => ({
                  ...score,
                  marks: toDecimalNumber(score.marks),
              }))
            : undefined,
        scoreCount: record._count?.scores ?? record.scores?.length ?? 0,
    };
}

class AssessmentRepository {
    async findAssessments({
        page = 1,
        limit = 20,
        search = "",
        academicYearId = null,
        termId = null,
        classId = null,
        subjectId = null,
        teacherId = null,
        assessmentType = null,
        status = null,
        dateFrom = null,
        dateTo = null,
        assessmentDate = null,
        includeDeleted = false,
        onlyDeleted = false,
        sortBy = "assessmentDate",
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
        if (assessmentType) where.assessmentType = assessmentType;
        if (status) where.status = status;

        if (assessmentDate) {
            where.assessmentDate = assessmentDate;
        } else if (dateFrom || dateTo) {
            where.assessmentDate = {};
            if (dateFrom) where.assessmentDate.gte = dateFrom;
            if (dateTo) where.assessmentDate.lte = dateTo;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
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
            "assessmentDate",
            "maxMarks",
            "assessmentType",
            "status",
            "title",
        ]);
        const orderField = allowedSort.has(sortBy) ? sortBy : "assessmentDate";
        const orderDir = sortOrder === "asc" ? "asc" : "desc";
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.assessment.findMany({
                where,
                select: assessmentListSelect,
                orderBy: [
                    { [orderField]: orderDir },
                    { id: "desc" },
                ],
                skip,
                take: limit,
            }),
            prisma.assessment.count({ where }),
        ]);

        return {
            data: data.map(mapAssessment),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findAssessmentById(id, { includeDeleted = false } = {}) {
        const record = await prisma.assessment.findFirst({
            where: {
                id: Number(id),
                ...(includeDeleted ? {} : { deletedAt: null }),
            },
            select: assessmentDetailSelect,
        });
        return mapAssessment(record);
    }

    async findDuplicate({
        classId,
        subjectId,
        assessmentType,
        assessmentDate,
        excludeId = null,
    }) {
        return prisma.assessment.findFirst({
            where: {
                classId: Number(classId),
                subjectId: Number(subjectId),
                assessmentType,
                assessmentDate,
                deletedAt: null,
                ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
            },
            select: { id: true, title: true, assessmentType: true },
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

    async findActiveEnrollment({
        studentId,
        academicYearId,
        schoolClassId,
        termId = null,
    }) {
        const where = {
            studentId: Number(studentId),
            academicYearId: Number(academicYearId),
            schoolClassId: Number(schoolClassId),
            deletedAt: null,
            status: "ACTIVE",
        };

        if (termId) {
            where.OR = [{ termId: Number(termId) }, { termId: null }];
        }

        return prisma.enrollment.findFirst({
            where,
            select: {
                id: true,
                studentId: true,
                schoolClassId: true,
                academicYearId: true,
                termId: true,
                status: true,
            },
            orderBy: [{ termId: "desc" }],
        });
    }

    async createAssessment(data) {
        const record = await prisma.assessment.create({
            data: {
                title: data.title ?? null,
                academicYearId: Number(data.academicYearId),
                termId: Number(data.termId),
                classId: Number(data.classId),
                subjectId: Number(data.subjectId),
                teacherId: Number(data.teacherId),
                assessmentType: data.assessmentType,
                maxMarks: data.maxMarks,
                assessmentDate: data.assessmentDate,
                remarks: data.remarks ?? null,
                status: data.status || "ACTIVE",
            },
            select: assessmentDetailSelect,
        });
        return mapAssessment(record);
    }

    async updateAssessment(id, data) {
        const record = await prisma.assessment.update({
            where: { id: Number(id) },
            data: {
                ...(data.title !== undefined && { title: data.title }),
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
                ...(data.assessmentType !== undefined && {
                    assessmentType: data.assessmentType,
                }),
                ...(data.maxMarks !== undefined && {
                    maxMarks: data.maxMarks,
                }),
                ...(data.assessmentDate !== undefined && {
                    assessmentDate: data.assessmentDate,
                }),
                ...(data.remarks !== undefined && { remarks: data.remarks }),
                ...(data.status !== undefined && { status: data.status }),
            },
            select: assessmentDetailSelect,
        });
        return mapAssessment(record);
    }

    async softDeleteAssessment(id) {
        const record = await prisma.assessment.update({
            where: { id: Number(id) },
            data: {
                deletedAt: new Date(),
                status: "ARCHIVED",
            },
            select: assessmentListSelect,
        });
        return mapAssessment(record);
    }

    async restoreAssessment(id) {
        const record = await prisma.assessment.update({
            where: { id: Number(id) },
            data: {
                deletedAt: null,
                status: "ACTIVE",
            },
            select: assessmentDetailSelect,
        });
        return mapAssessment(record);
    }

    async upsertScore({ assessmentId, studentId, marks, remarks }) {
        const record = await prisma.assessmentScore.upsert({
            where: {
                assessmentId_studentId: {
                    assessmentId: Number(assessmentId),
                    studentId: Number(studentId),
                },
            },
            create: {
                assessmentId: Number(assessmentId),
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

    async deleteScore(assessmentId, studentId) {
        return prisma.assessmentScore.deleteMany({
            where: {
                assessmentId: Number(assessmentId),
                studentId: Number(studentId),
            },
        });
    }

    async deleteScoresForAssessment(assessmentId) {
        return prisma.assessmentScore.deleteMany({
            where: { assessmentId: Number(assessmentId) },
        });
    }

    async getScoreStats({
        academicYearId = null,
        termId = null,
        classId = null,
        subjectId = null,
        teacherId = null,
        assessmentType = null,
        dateFrom = null,
        dateTo = null,
    } = {}) {
        const assessmentWhere = {
            deletedAt: null,
            status: { not: "ARCHIVED" },
        };

        if (academicYearId) assessmentWhere.academicYearId = academicYearId;
        if (termId) assessmentWhere.termId = termId;
        if (classId) assessmentWhere.classId = classId;
        if (subjectId) assessmentWhere.subjectId = subjectId;
        if (teacherId) assessmentWhere.teacherId = teacherId;
        if (assessmentType) assessmentWhere.assessmentType = assessmentType;

        if (dateFrom || dateTo) {
            assessmentWhere.assessmentDate = {};
            if (dateFrom) assessmentWhere.assessmentDate.gte = dateFrom;
            if (dateTo) assessmentWhere.assessmentDate.lte = dateTo;
        }

        const [assessmentCount, scoreAgg, byType] = await Promise.all([
            prisma.assessment.count({ where: assessmentWhere }),
            prisma.assessmentScore.aggregate({
                where: { assessment: assessmentWhere },
                _avg: { marks: true },
                _min: { marks: true },
                _max: { marks: true },
                _count: { _all: true },
            }),
            prisma.assessment.groupBy({
                by: ["assessmentType"],
                where: assessmentWhere,
                _count: { _all: true },
            }),
        ]);

        return {
            assessmentCount,
            scoreCount: scoreAgg._count._all || 0,
            averageMarks: toDecimalNumber(scoreAgg._avg.marks) ?? 0,
            minMarks: toDecimalNumber(scoreAgg._min.marks),
            maxMarksRecorded: toDecimalNumber(scoreAgg._max.marks),
            byType: byType.map((row) => ({
                assessmentType: row.assessmentType,
                count: row._count._all,
            })),
        };
    }

    async getAssessmentsForAnalytics({
        academicYearId = null,
        termId = null,
        classId = null,
        subjectId = null,
        teacherId = null,
        assessmentType = null,
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
        if (assessmentType) where.assessmentType = assessmentType;

        if (dateFrom || dateTo) {
            where.assessmentDate = {};
            if (dateFrom) where.assessmentDate.gte = dateFrom;
            if (dateTo) where.assessmentDate.lte = dateTo;
        }

        const records = await prisma.assessment.findMany({
            where,
            select: {
                id: true,
                title: true,
                classId: true,
                subjectId: true,
                teacherId: true,
                assessmentType: true,
                maxMarks: true,
                assessmentDate: true,
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
            orderBy: [{ assessmentDate: "asc" }, { id: "asc" }],
        });

        return records.map((record) => ({
            ...record,
            maxMarks: toDecimalNumber(record.maxMarks),
            scores: record.scores.map((score) => ({
                ...score,
                marks: toDecimalNumber(score.marks),
            })),
        }));
    }
}

module.exports = new AssessmentRepository();
