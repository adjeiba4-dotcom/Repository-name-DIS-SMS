// repositories/studentPromotion.repository.js
// Student Promotion & Graduation — data access

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
    isCurrent: true,
    status: true,
};

const schoolClassSelect = {
    id: true,
    classCode: true,
    className: true,
    academicYearId: true,
    capacity: true,
    status: true,
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
};

const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
};

const reportCardSelect = {
    id: true,
    studentId: true,
    academicYearId: true,
    termId: true,
    classId: true,
    averageScore: true,
    overallGrade: true,
    classPosition: true,
    subjectCount: true,
    passedCount: true,
    failedCount: true,
    promotionDecision: true,
    promoted: true,
    workflowStatus: true,
    isPublished: true,
    isLocked: true,
    status: true,
    deletedAt: true,
};

const promotionInclude = {
    student: { select: studentSelect },
    fromClass: { select: schoolClassSelect },
    toClass: { select: schoolClassSelect },
    fromAcademicYear: { select: academicYearSelect },
    toAcademicYear: { select: academicYearSelect },
    term: { select: termSelect },
    reportCard: { select: reportCardSelect },
    resultingEnrollment: {
        select: {
            id: true,
            enrollmentNumber: true,
            schoolClassId: true,
            academicYearId: true,
            status: true,
        },
    },
    recommendedBy: { select: userSelect },
    approvedBy: { select: userSelect },
    executedBy: { select: userSelect },
};

function toDecimalNumber(value) {
    if (value == null) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
}

function mapPromotion(record) {
    if (!record) return null;
    return {
        ...record,
        averageScore: toDecimalNumber(record.averageScore),
        reportCard: record.reportCard
            ? {
                  ...record.reportCard,
                  averageScore: toDecimalNumber(record.reportCard.averageScore),
              }
            : null,
    };
}

const SORT_MAP = {
    studentName: [
        { student: { lastName: "asc" } },
        { student: { firstName: "asc" } },
    ],
    admissionNo: { student: { admissionNo: "asc" } },
    averageScore: { averageScore: "desc" },
    decision: { decision: "asc" },
    workflowStatus: { workflowStatus: "asc" },
    promotionDate: { promotionDate: "desc" },
    createdAt: { createdAt: "desc" },
    updatedAt: { updatedAt: "desc" },
    executedAt: { executedAt: "desc" },
};

class StudentPromotionRepository {
    async findPromotions({
        page = 1,
        limit = 20,
        search = "",
        fromAcademicYearId = null,
        toAcademicYearId = null,
        termId = null,
        fromClassId = null,
        toClassId = null,
        studentId = null,
        decision = null,
        workflowStatus = null,
        status = null,
        graduatesOnly = false,
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

        if (fromAcademicYearId) where.fromAcademicYearId = fromAcademicYearId;
        if (toAcademicYearId) where.toAcademicYearId = toAcademicYearId;
        if (termId) where.termId = termId;
        if (fromClassId) where.fromClassId = fromClassId;
        if (toClassId) where.toClassId = toClassId;
        if (studentId) where.studentId = studentId;
        if (decision) where.decision = decision;
        if (workflowStatus) where.workflowStatus = workflowStatus;
        if (graduatesOnly) where.decision = "GRADUATED";

        const keyword = String(search || "").trim();
        if (keyword) {
            where.AND = [
                ...(Array.isArray(where.AND) ? where.AND : []),
                {
                    OR: [
                        { student: { firstName: { contains: keyword } } },
                        { student: { lastName: { contains: keyword } } },
                        { student: { admissionNo: { contains: keyword } } },
                        { fromClass: { className: { contains: keyword } } },
                        { fromClass: { classCode: { contains: keyword } } },
                        { toClass: { className: { contains: keyword } } },
                        { remarks: { contains: keyword } },
                    ],
                },
            ];
        }

        const orderBy =
            SORT_MAP[sortBy] ||
            ({ [sortBy]: sortOrder === "asc" ? "asc" : "desc" });

        const skip = (Math.max(1, page) - 1) * Math.max(1, limit);

        const [total, rows] = await Promise.all([
            prisma.studentPromotion.count({ where }),
            prisma.studentPromotion.findMany({
                where,
                include: promotionInclude,
                orderBy,
                skip,
                take: Math.max(1, limit),
            }),
        ]);

        return {
            data: rows.map(mapPromotion),
            page: Math.max(1, page),
            limit: Math.max(1, limit),
            total,
            totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
        };
    }

    async findPromotionById(id, { includeDeleted = false } = {}) {
        const record = await prisma.studentPromotion.findFirst({
            where: {
                id: Number(id),
                ...(includeDeleted ? {} : { deletedAt: null }),
            },
            include: promotionInclude,
        });
        return mapPromotion(record);
    }

    async findByStudentAndYear(
        studentId,
        fromAcademicYearId,
        { includeDeleted = false } = {}
    ) {
        const record = await prisma.studentPromotion.findFirst({
            where: {
                studentId: Number(studentId),
                fromAcademicYearId: Number(fromAcademicYearId),
                ...(includeDeleted ? {} : { deletedAt: null }),
            },
            include: promotionInclude,
        });
        return mapPromotion(record);
    }

    async findPromotionsByIds(ids = []) {
        if (!ids.length) return [];
        const rows = await prisma.studentPromotion.findMany({
            where: {
                id: { in: ids.map(Number) },
                deletedAt: null,
                status: { not: "ARCHIVED" },
            },
            include: promotionInclude,
        });
        return rows.map(mapPromotion);
    }

    async findStudentHistory(studentId) {
        const rows = await prisma.studentPromotion.findMany({
            where: {
                studentId: Number(studentId),
                deletedAt: null,
                status: { not: "ARCHIVED" },
            },
            include: promotionInclude,
            orderBy: [{ fromAcademicYear: { startDate: "desc" } }, { id: "desc" }],
        });
        return rows.map(mapPromotion);
    }

    async createPromotion(data) {
        const record = await prisma.studentPromotion.create({
            data,
            include: promotionInclude,
        });
        return mapPromotion(record);
    }

    async updatePromotion(id, data) {
        const record = await prisma.studentPromotion.update({
            where: { id: Number(id) },
            data,
            include: promotionInclude,
        });
        return mapPromotion(record);
    }

    async softDeletePromotion(id) {
        const record = await prisma.studentPromotion.update({
            where: { id: Number(id) },
            data: {
                status: "ARCHIVED",
                deletedAt: new Date(),
            },
            include: promotionInclude,
        });
        return mapPromotion(record);
    }

    async restorePromotion(id) {
        const record = await prisma.studentPromotion.update({
            where: { id: Number(id) },
            data: {
                status: "ACTIVE",
                deletedAt: null,
            },
            include: promotionInclude,
        });
        return mapPromotion(record);
    }

    async getStats({
        fromAcademicYearId = null,
        termId = null,
        fromClassId = null,
        scope = "overview",
    } = {}) {
        const where = {
            deletedAt: null,
            status: { not: "ARCHIVED" },
        };
        if (fromAcademicYearId) where.fromAcademicYearId = fromAcademicYearId;
        if (termId) where.termId = termId;
        if (fromClassId) where.fromClassId = fromClassId;

        const rows = await prisma.studentPromotion.findMany({
            where,
            select: {
                id: true,
                decision: true,
                workflowStatus: true,
                averageScore: true,
                fromClassId: true,
                fromClass: {
                    select: {
                        id: true,
                        classCode: true,
                        className: true,
                    },
                },
            },
        });

        const overview = {
            promotions: rows.length,
            draft: 0,
            approved: 0,
            executed: 0,
            cancelled: 0,
            promoted: 0,
            promotedOnProbation: 0,
            repeat: 0,
            graduated: 0,
            withdrawn: 0,
            transferred: 0,
            averageScore: null,
        };

        let avgSum = 0;
        let avgCount = 0;

        for (const row of rows) {
            if (row.workflowStatus === "DRAFT") overview.draft += 1;
            if (row.workflowStatus === "APPROVED") overview.approved += 1;
            if (row.workflowStatus === "EXECUTED") overview.executed += 1;
            if (row.workflowStatus === "CANCELLED") overview.cancelled += 1;

            if (row.decision === "PROMOTED") overview.promoted += 1;
            if (row.decision === "PROMOTED_ON_PROBATION") {
                overview.promotedOnProbation += 1;
            }
            if (row.decision === "REPEAT") overview.repeat += 1;
            if (row.decision === "GRADUATED") overview.graduated += 1;
            if (row.decision === "WITHDRAWN") overview.withdrawn += 1;
            if (row.decision === "TRANSFERRED") overview.transferred += 1;

            if (row.averageScore != null) {
                avgSum += Number(row.averageScore);
                avgCount += 1;
            }
        }

        overview.averageScore =
            avgCount > 0 ? Math.round((avgSum / avgCount) * 100) / 100 : null;

        if (scope !== "class") {
            return { scope: "overview", overview };
        }

        const byClassMap = new Map();
        for (const row of rows) {
            const key = row.fromClassId;
            if (!byClassMap.has(key)) {
                byClassMap.set(key, {
                    classId: row.fromClassId,
                    classCode: row.fromClass?.classCode || null,
                    className: row.fromClass?.className || null,
                    total: 0,
                    promoted: 0,
                    promotedOnProbation: 0,
                    repeat: 0,
                    graduated: 0,
                    withdrawn: 0,
                    transferred: 0,
                    executed: 0,
                    draft: 0,
                    approved: 0,
                });
            }
            const bucket = byClassMap.get(key);
            bucket.total += 1;
            if (row.decision === "PROMOTED") bucket.promoted += 1;
            if (row.decision === "PROMOTED_ON_PROBATION") {
                bucket.promotedOnProbation += 1;
            }
            if (row.decision === "REPEAT") bucket.repeat += 1;
            if (row.decision === "GRADUATED") bucket.graduated += 1;
            if (row.decision === "WITHDRAWN") bucket.withdrawn += 1;
            if (row.decision === "TRANSFERRED") bucket.transferred += 1;
            if (row.workflowStatus === "EXECUTED") bucket.executed += 1;
            if (row.workflowStatus === "DRAFT") bucket.draft += 1;
            if (row.workflowStatus === "APPROVED") bucket.approved += 1;
        }

        return {
            scope: "class",
            overview,
            byClass: Array.from(byClassMap.values()).sort((a, b) =>
                String(a.className || "").localeCompare(String(b.className || ""))
            ),
        };
    }

    // ── Lookups used by the service ──────────────────────────────────────

    async findStudentById(id) {
        return prisma.student.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: studentSelect,
        });
    }

    async findSchoolClassById(id) {
        return prisma.schoolClass.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: schoolClassSelect,
        });
    }

    async findAcademicYearById(id) {
        return prisma.academicYear.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: academicYearSelect,
        });
    }

    async findNextAcademicYear(fromYear) {
        if (!fromYear?.endDate && !fromYear?.startDate) return null;
        return prisma.academicYear.findFirst({
            where: {
                deletedAt: null,
                status: { not: "ARCHIVED" },
                startDate: { gt: fromYear.endDate || fromYear.startDate },
            },
            select: academicYearSelect,
            orderBy: { startDate: "asc" },
        });
    }

    async findTermById(id) {
        return prisma.term.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: termSelect,
        });
    }

    async findClassByCodeInYear(classCode, academicYearId) {
        return prisma.schoolClass.findFirst({
            where: {
                classCode,
                academicYearId: Number(academicYearId),
                deletedAt: null,
                status: { not: "ARCHIVED" },
            },
            select: schoolClassSelect,
        });
    }

    async findPublishedReportCards({
        academicYearId,
        termId = null,
        classId = null,
        studentId = null,
    }) {
        const where = {
            deletedAt: null,
            status: { not: "ARCHIVED" },
            academicYearId: Number(academicYearId),
            OR: [
                { isPublished: true },
                { isLocked: true },
                { workflowStatus: { in: ["PUBLISHED", "LOCKED"] } },
            ],
        };
        if (termId) where.termId = Number(termId);
        if (classId) where.classId = Number(classId);
        if (studentId) where.studentId = Number(studentId);

        const rows = await prisma.reportCard.findMany({
            where,
            select: {
                ...reportCardSelect,
                student: { select: studentSelect },
                schoolClass: { select: schoolClassSelect },
                academicYear: { select: academicYearSelect },
                term: { select: termSelect },
            },
            orderBy: [
                { classId: "asc" },
                { student: { lastName: "asc" } },
                { student: { firstName: "asc" } },
            ],
        });

        return rows.map((row) => ({
            ...row,
            averageScore: toDecimalNumber(row.averageScore),
        }));
    }

    async findEnrollmentByStudentAndYear(studentId, academicYearId) {
        return prisma.enrollment.findFirst({
            where: {
                studentId: Number(studentId),
                academicYearId: Number(academicYearId),
            },
            select: {
                id: true,
                enrollmentNumber: true,
                schoolClassId: true,
                academicYearId: true,
                status: true,
                deletedAt: true,
            },
        });
    }

    async countActiveEnrollmentsInClass(schoolClassId) {
        return prisma.enrollment.count({
            where: {
                schoolClassId: Number(schoolClassId),
                deletedAt: null,
                status: { not: "ARCHIVED" },
            },
        });
    }

    async findLatestEnrollmentNumber(year) {
        const prefix = `ENR-${year}-`;
        return prisma.enrollment.findFirst({
            where: { enrollmentNumber: { startsWith: prefix } },
            select: { enrollmentNumber: true },
            orderBy: { enrollmentNumber: "desc" },
        });
    }

    async findEnrollmentByNumber(enrollmentNumber) {
        return prisma.enrollment.findFirst({
            where: { enrollmentNumber },
            select: { id: true, enrollmentNumber: true },
        });
    }

    async createEnrollment(data) {
        return prisma.enrollment.create({
            data,
            select: {
                id: true,
                enrollmentNumber: true,
                studentId: true,
                schoolClassId: true,
                academicYearId: true,
                status: true,
            },
        });
    }

    async updateStudent(id, data) {
        return prisma.student.update({
            where: { id: Number(id) },
            data,
            select: studentSelect,
        });
    }

    async getConfigValue(settingKey) {
        const row = await prisma.systemSetting.findUnique({
            where: { settingKey },
            select: { settingValue: true },
        });
        return row?.settingValue ?? null;
    }

    /**
     * Transaction helper for execute: enrollment + student + promotion update.
     */
    async executePromotionTransaction({
        promotionId,
        enrollmentData = null,
        studentUpdate = null,
        promotionUpdate,
    }) {
        return prisma.$transaction(async (tx) => {
            let enrollment = null;
            if (enrollmentData) {
                enrollment = await tx.enrollment.create({
                    data: enrollmentData,
                    select: {
                        id: true,
                        enrollmentNumber: true,
                        studentId: true,
                        schoolClassId: true,
                        academicYearId: true,
                        status: true,
                    },
                });
                promotionUpdate.resultingEnrollmentId = enrollment.id;
            }

            if (studentUpdate) {
                await tx.student.update({
                    where: { id: studentUpdate.id },
                    data: studentUpdate.data,
                });
            }

            const promotion = await tx.studentPromotion.update({
                where: { id: Number(promotionId) },
                data: promotionUpdate,
                include: promotionInclude,
            });

            return {
                promotion: mapPromotion(promotion),
                enrollment,
            };
        });
    }
}

module.exports = new StudentPromotionRepository();
