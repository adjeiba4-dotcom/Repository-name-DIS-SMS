// repositories/reportCard.repository.js
// Report Cards — snapshot store over published Results

const prisma = require("../database/db");

const academicYearSelect = {
    id: true,
    name: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    status: true,
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
};

const schoolClassSelect = {
    id: true,
    classCode: true,
    className: true,
    academicYearId: true,
    classTeacherId: true,
    status: true,
    classTeacher: {
        select: {
            id: true,
            staffNo: true,
            firstName: true,
            lastName: true,
        },
    },
};

const studentSelect = {
    id: true,
    admissionNo: true,
    firstName: true,
    lastName: true,
    otherName: true,
    gender: true,
    dateOfBirth: true,
    classId: true,
    status: true,
};

const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
};

const reportCardBaseSelect = {
    id: true,
    studentId: true,
    academicYearId: true,
    termId: true,
    classId: true,
    templateKey: true,
    totalScore: true,
    averageScore: true,
    overallGrade: true,
    classPosition: true,
    subjectCount: true,
    passedCount: true,
    failedCount: true,
    daysPresent: true,
    daysAbsent: true,
    daysLate: true,
    daysExcused: true,
    attendancePercentage: true,
    teacherRemarks: true,
    headmasterRemarks: true,
    promotionDecision: true,
    promoted: true,
    workflowStatus: true,
    generatedAt: true,
    generatedById: true,
    isVerified: true,
    verifiedAt: true,
    verifiedById: true,
    isPublished: true,
    publishedAt: true,
    publishedById: true,
    isLocked: true,
    lockedAt: true,
    lockedById: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    student: { select: studentSelect },
    academicYear: { select: academicYearSelect },
    term: { select: termSelect },
    schoolClass: { select: schoolClassSelect },
    generatedBy: { select: userSelect },
    verifiedBy: { select: userSelect },
    publishedBy: { select: userSelect },
    lockedBy: { select: userSelect },
};

/** Directory lists omit the heavy JSON snapshot blob. */
const reportCardListSelect = reportCardBaseSelect;

/** Detail / generate / preview payloads include the frozen snapshot. */
const reportCardDetailSelect = {
    ...reportCardBaseSelect,
    snapshot: true,
};

function toDecimalNumber(value) {
    if (value == null) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
}

function mapReportCard(record) {
    if (!record) return null;
    return {
        ...record,
        totalScore: toDecimalNumber(record.totalScore),
        averageScore: toDecimalNumber(record.averageScore),
        attendancePercentage: toDecimalNumber(record.attendancePercentage),
    };
}

const SORT_MAP = {
    averageScore: { averageScore: "desc" },
    classPosition: { classPosition: "asc" },
    studentName: [
        { student: { lastName: "asc" } },
        { student: { firstName: "asc" } },
    ],
    admissionNo: { student: { admissionNo: "asc" } },
    className: { schoolClass: { className: "asc" } },
    createdAt: { createdAt: "desc" },
    updatedAt: { updatedAt: "desc" },
    publishedAt: { publishedAt: "desc" },
};

class ReportCardRepository {
    async findReportCards({
        page = 1,
        limit = 20,
        search = "",
        academicYearId = null,
        termId = null,
        classId = null,
        studentId = null,
        status = null,
        isVerified = null,
        isPublished = null,
        isLocked = null,
        workflowStatus = null,
        promotionDecision = null,
        templateKey = null,
        includeDeleted = false,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = {}) {
        const where = {};

        if (!includeDeleted) {
            where.deletedAt = null;
            where.status = status || { not: "ARCHIVED" };
        } else if (status) {
            where.status = status;
        } else {
            where.OR = [{ deletedAt: { not: null } }, { status: "ARCHIVED" }];
        }

        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (classId) where.classId = classId;
        if (studentId) where.studentId = studentId;
        if (isVerified !== null) where.isVerified = isVerified;
        if (isPublished !== null) where.isPublished = isPublished;
        if (isLocked !== null) where.isLocked = isLocked;
        if (workflowStatus) where.workflowStatus = workflowStatus;
        if (promotionDecision) where.promotionDecision = promotionDecision;
        if (templateKey) where.templateKey = templateKey;

        const keyword = String(search || "").trim();
        if (keyword) {
            where.AND = [
                ...(Array.isArray(where.AND) ? where.AND : where.OR ? [{ OR: where.OR }] : []),
                {
                    OR: [
                        { student: { firstName: { contains: keyword } } },
                        { student: { lastName: { contains: keyword } } },
                        { student: { admissionNo: { contains: keyword } } },
                        { overallGrade: { contains: keyword } },
                        { schoolClass: { className: { contains: keyword } } },
                        { schoolClass: { classCode: { contains: keyword } } },
                    ],
                },
            ];
            delete where.OR;
        }

        const orderBy =
            SORT_MAP[sortBy] ||
            (sortOrder === "asc" ? { createdAt: "asc" } : { createdAt: "desc" });

        const skip = (Math.max(page, 1) - 1) * limit;

        const [total, rows] = await Promise.all([
            prisma.reportCard.count({ where }),
            prisma.reportCard.findMany({
                where,
                select: reportCardListSelect,
                orderBy,
                skip,
                take: limit,
            }),
        ]);

        return {
            data: rows.map(mapReportCard),
            page: Math.max(page, 1),
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }

    async findReportCardById(id) {
        const record = await prisma.reportCard.findFirst({
            where: { id: Number(id) },
            select: reportCardDetailSelect,
        });
        return mapReportCard(record);
    }

    async findReportCardByScope(
        studentId,
        academicYearId,
        termId,
        { excludeId = null, includeDeleted = false } = {}
    ) {
        const where = {
            studentId: Number(studentId),
            academicYearId: Number(academicYearId),
            termId: Number(termId),
            ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
        };
        if (!includeDeleted) {
            where.deletedAt = null;
        }

        return prisma.reportCard
            .findFirst({
                where,
                select: reportCardDetailSelect,
                orderBy: [{ deletedAt: "asc" }, { updatedAt: "desc" }],
            })
            .then(mapReportCard);
    }

    async createReportCard(data) {
        const created = await prisma.reportCard.create({
            data,
            select: reportCardDetailSelect,
        });
        return mapReportCard(created);
    }

    async updateReportCard(id, data) {
        const updated = await prisma.reportCard.update({
            where: { id: Number(id) },
            data,
            select: reportCardDetailSelect,
        });
        return mapReportCard(updated);
    }

    async softDeleteReportCard(id) {
        return prisma.reportCard
            .update({
                where: { id: Number(id) },
                data: {
                    status: "ARCHIVED",
                    deletedAt: new Date(),
                },
                select: reportCardDetailSelect,
            })
            .then(mapReportCard);
    }

    async restoreReportCard(id) {
        return prisma.reportCard
            .update({
                where: { id: Number(id) },
                data: {
                    status: "ACTIVE",
                    deletedAt: null,
                },
                select: reportCardDetailSelect,
            })
            .then(mapReportCard);
    }

    async findIdsByScope({ ids = null, academicYearId = null, termId = null, classId = null } = {}) {
        if (Array.isArray(ids) && ids.length) {
            return ids.map(Number).filter(Boolean);
        }
        const where = { deletedAt: null, status: { not: "ARCHIVED" } };
        if (academicYearId) where.academicYearId = Number(academicYearId);
        if (termId) where.termId = Number(termId);
        if (classId) where.classId = Number(classId);

        const rows = await prisma.reportCard.findMany({
            where,
            select: { id: true },
        });
        return rows.map((row) => row.id);
    }

    async findStudentById(id) {
        return prisma.student.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: {
                ...studentSelect,
                schoolClass: { select: schoolClassSelect },
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

    async findClassById(id) {
        return prisma.schoolClass.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: schoolClassSelect,
        });
    }

    async findEnrolledStudents({ academicYearId, classId }) {
        return prisma.enrollment.findMany({
            where: {
                academicYearId: Number(academicYearId),
                schoolClassId: Number(classId),
                deletedAt: null,
                status: "ACTIVE",
                student: { deletedAt: null, status: "ACTIVE" },
            },
            select: {
                studentId: true,
                student: {
                    select: {
                        ...studentSelect,
                        schoolClass: { select: schoolClassSelect },
                    },
                },
            },
            orderBy: [
                { student: { lastName: "asc" } },
                { student: { firstName: "asc" } },
            ],
        });
    }

    /**
     * Published or locked results only — report cards never use draft/generated/verified-only rows.
     */
    async findPublishedResultsForStudent({ studentId, academicYearId, termId, classId = null }) {
        const where = {
            studentId: Number(studentId),
            academicYearId: Number(academicYearId),
            termId: Number(termId),
            deletedAt: null,
            status: { not: "ARCHIVED" },
            OR: [{ isPublished: true }, { isLocked: true }, { workflowStatus: { in: ["PUBLISHED", "LOCKED"] } }],
        };
        if (classId) where.classId = Number(classId);

        const rows = await prisma.result.findMany({
            where,
            select: {
                id: true,
                academicYearId: true,
                termId: true,
                classId: true,
                subjectId: true,
                studentId: true,
                examinationId: true,
                caScore: true,
                examScore: true,
                caWeight: true,
                examWeight: true,
                finalScore: true,
                gradeId: true,
                remarks: true,
                subjectPosition: true,
                classPosition: true,
                subjectAverage: true,
                classAverage: true,
                isPassed: true,
                workflowStatus: true,
                isPublished: true,
                isLocked: true,
                subject: {
                    select: {
                        id: true,
                        subjectCode: true,
                        subjectName: true,
                        shortName: true,
                    },
                },
                grade: {
                    select: {
                        id: true,
                        grade: true,
                        remarks: true,
                        isPass: true,
                        gradePoint: true,
                    },
                },
                examination: {
                    select: {
                        id: true,
                        name: true,
                        examinationType: true,
                    },
                },
            },
            orderBy: { subject: { subjectName: "asc" } },
        });

        return rows.map((row) => ({
            ...row,
            caScore: toDecimalNumber(row.caScore),
            examScore: toDecimalNumber(row.examScore),
            caWeight: toDecimalNumber(row.caWeight),
            examWeight: toDecimalNumber(row.examWeight),
            finalScore: toDecimalNumber(row.finalScore),
            subjectAverage: toDecimalNumber(row.subjectAverage),
            classAverage: toDecimalNumber(row.classAverage),
            gradeLetter: row.grade?.grade || null,
            gradePoint: toDecimalNumber(row.grade?.gradePoint),
        }));
    }

    async findAttendanceSummary({ studentId, academicYearId, termId }) {
        const groups = await prisma.attendance.groupBy({
            by: ["status"],
            where: {
                studentId: Number(studentId),
                academicYearId: Number(academicYearId),
                termId: Number(termId),
            },
            _count: { _all: true },
        });

        const counts = {
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            EXCUSED: 0,
            total: 0,
        };

        for (const group of groups) {
            counts[group.status] = group._count._all;
            counts.total += group._count._all;
        }

        const attended = counts.PRESENT + counts.LATE;
        const percentage =
            counts.total > 0
                ? Math.round((attended / counts.total) * 1000) / 10
                : null;

        return {
            daysPresent: counts.PRESENT,
            daysAbsent: counts.ABSENT,
            daysLate: counts.LATE,
            daysExcused: counts.EXCUSED,
            totalDays: counts.total,
            attendancePercentage: percentage,
        };
    }

    async findSchoolProfile() {
        return prisma.schoolProfile.findFirst({
            orderBy: { id: "asc" },
        });
    }

    async findStudentPhotoUrl(studentId) {
        const asset = await prisma.fileAsset.findFirst({
            where: {
                entityType: "Student",
                entityId: Number(studentId),
                category: "PHOTO",
            },
            orderBy: { createdAt: "desc" },
            select: { url: true },
        });
        return asset?.url || null;
    }

    /**
     * Prefer the default GradeScale (parity with Results Engine); fall back to unscoped ACTIVE grades.
     */
    async findActiveGrades() {
        const defaultScale = await prisma.gradeScale.findFirst({
            where: { isDefault: true, status: "ACTIVE" },
            select: { id: true },
        });

        const where = { status: "ACTIVE" };
        if (defaultScale) {
            where.OR = [
                { gradeScaleId: defaultScale.id },
                { gradeScaleId: null },
            ];
        }

        const rows = await prisma.grade.findMany({
            where,
            orderBy: [{ sortOrder: "asc" }, { minimumScore: "desc" }],
            select: {
                id: true,
                grade: true,
                minimumScore: true,
                maximumScore: true,
                remarks: true,
                isPass: true,
                gradePoint: true,
            },
        });

        return rows.map((row) => ({
            ...row,
            minimumScore: toDecimalNumber(row.minimumScore),
            maximumScore: toDecimalNumber(row.maximumScore),
            gradePoint: toDecimalNumber(row.gradePoint),
        }));
    }

    async ensureDefaultGradeScale() {
        const resultRepository = require("./result.repository");
        return resultRepository.ensureDefaultGradeScale();
    }

    async getOverviewStats({ academicYearId = null, termId = null, classId = null } = {}) {
        const where = { deletedAt: null, status: { not: "ARCHIVED" } };
        if (academicYearId) where.academicYearId = Number(academicYearId);
        if (termId) where.termId = Number(termId);
        if (classId) where.classId = Number(classId);

        const [total, verified, published, locked, promoted] = await Promise.all([
            prisma.reportCard.count({ where }),
            prisma.reportCard.count({ where: { ...where, isVerified: true } }),
            prisma.reportCard.count({ where: { ...where, isPublished: true } }),
            prisma.reportCard.count({ where: { ...where, isLocked: true } }),
            prisma.reportCard.count({
                where: { ...where, promotionDecision: "PROMOTED" },
            }),
        ]);

        const avgAgg = await prisma.reportCard.aggregate({
            where,
            _avg: { averageScore: true, attendancePercentage: true },
        });

        return {
            reportCards: total,
            verified,
            published,
            locked,
            promoted,
            averageScore: toDecimalNumber(avgAgg._avg.averageScore),
            averageAttendance: toDecimalNumber(avgAgg._avg.attendancePercentage),
        };
    }

    async getClassBreakdown({ academicYearId = null, termId = null } = {}) {
        const where = { deletedAt: null, status: { not: "ARCHIVED" } };
        if (academicYearId) where.academicYearId = Number(academicYearId);
        if (termId) where.termId = Number(termId);

        const groups = await prisma.reportCard.groupBy({
            by: ["classId"],
            where,
            _count: { _all: true },
            _avg: { averageScore: true },
        });

        if (!groups.length) return [];

        const classIds = groups.map((g) => g.classId);
        const classes = await prisma.schoolClass.findMany({
            where: { id: { in: classIds } },
            select: schoolClassSelect,
        });
        const classMap = new Map(classes.map((c) => [c.id, c]));

        return groups.map((group) => ({
            classId: group.classId,
            schoolClass: classMap.get(group.classId) || null,
            count: group._count._all,
            averageScore: toDecimalNumber(group._avg.averageScore),
        }));
    }
}

module.exports = new ReportCardRepository();
