// repositories/result.repository.js

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

const examinationSelect = {
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
    isLocked: true,
    status: true,
    deletedAt: true,
};

const gradeSelect = {
    id: true,
    grade: true,
    description: true,
    minimumScore: true,
    maximumScore: true,
    gradePoint: true,
    remarks: true,
    isPass: true,
    sortOrder: true,
    status: true,
};

const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
};

const resultListSelect = {
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
    academicYear: { select: academicYearSelect },
    term: { select: termSelect },
    schoolClass: { select: schoolClassSelect },
    subject: { select: subjectSelect },
    student: { select: studentSelect },
    examination: { select: examinationSelect },
    grade: { select: gradeSelect },
    verifiedBy: { select: userSelect },
    publishedBy: { select: userSelect },
    lockedBy: { select: userSelect },
};

function toDecimalNumber(value) {
    if (value == null) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
}

function mapResult(record) {
    if (!record) return null;
    return {
        ...record,
        caScore: toDecimalNumber(record.caScore),
        examScore: toDecimalNumber(record.examScore),
        caWeight: toDecimalNumber(record.caWeight),
        examWeight: toDecimalNumber(record.examWeight),
        finalScore: toDecimalNumber(record.finalScore),
        subjectAverage: toDecimalNumber(record.subjectAverage),
        classAverage: toDecimalNumber(record.classAverage),
        grade: record.grade
            ? {
                  ...record.grade,
                  minimumScore: toDecimalNumber(record.grade.minimumScore),
                  maximumScore: toDecimalNumber(record.grade.maximumScore),
                  gradePoint: toDecimalNumber(record.grade.gradePoint),
              }
            : null,
        examination: record.examination
            ? {
                  ...record.examination,
                  maxMarks: toDecimalNumber(record.examination.maxMarks),
                  passingMarks: toDecimalNumber(record.examination.passingMarks),
              }
            : null,
        gradeLetter: record.grade?.grade || null,
    };
}

const SORT_MAP = {
    finalScore: { finalScore: "desc" },
    subjectPosition: { subjectPosition: "asc" },
    classPosition: { classPosition: "asc" },
    studentName: [{ student: { lastName: "asc" } }, { student: { firstName: "asc" } }],
    admissionNo: { student: { admissionNo: "asc" } },
    subjectName: { subject: { subjectName: "asc" } },
    className: { schoolClass: { className: "asc" } },
    createdAt: { createdAt: "desc" },
    updatedAt: { updatedAt: "desc" },
};

class ResultRepository {
    async findResults({
        page = 1,
        limit = 20,
        search = "",
        academicYearId = null,
        termId = null,
        classId = null,
        subjectId = null,
        studentId = null,
        examinationId = null,
        gradeId = null,
        status = null,
        isPassed = null,
        isVerified = null,
        isPublished = null,
        isLocked = null,
        workflowStatus = null,
        onlyDeleted = false,
        sortBy = "finalScore",
        sortOrder = "desc",
    } = {}) {
        const where = onlyDeleted ? { deletedAt: { not: null } } : { deletedAt: null };

        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (classId) where.classId = classId;
        if (subjectId) where.subjectId = subjectId;
        if (studentId) where.studentId = studentId;
        if (examinationId) where.examinationId = examinationId;
        if (gradeId) where.gradeId = gradeId;
        if (status) where.status = status;
        if (workflowStatus) where.workflowStatus = workflowStatus;
        if (isPassed !== null) where.isPassed = isPassed;
        if (isVerified !== null) where.isVerified = isVerified;
        if (isPublished !== null) where.isPublished = isPublished;
        if (isLocked !== null) where.isLocked = isLocked;

        if (search) {
            where.OR = [
                { student: { admissionNo: { contains: search } } },
                { student: { firstName: { contains: search } } },
                { student: { lastName: { contains: search } } },
                { subject: { subjectName: { contains: search } } },
                { subject: { subjectCode: { contains: search } } },
                { schoolClass: { className: { contains: search } } },
                { schoolClass: { classCode: { contains: search } } },
                { grade: { grade: { contains: search } } },
                { remarks: { contains: search } },
                { examination: { name: { contains: search } } },
            ];
        }

        const orderBase = SORT_MAP[sortBy] || SORT_MAP.finalScore;
        let orderBy;
        if (Array.isArray(orderBase)) {
            orderBy = orderBase.map((entry) => {
                const key = Object.keys(entry)[0];
                if (typeof entry[key] === "object") return entry;
                return { [key]: sortOrder === "asc" ? "asc" : "desc" };
            });
        } else {
            const key = Object.keys(orderBase)[0];
            if (typeof orderBase[key] === "object") {
                orderBy = orderBase;
            } else {
                orderBy = { [key]: sortOrder === "asc" ? "asc" : "desc" };
            }
        }

        const skip = (page - 1) * limit;
        const [total, rows] = await Promise.all([
            prisma.result.count({ where }),
            prisma.result.findMany({
                where,
                select: resultListSelect,
                orderBy,
                skip,
                take: limit,
            }),
        ]);

        return {
            data: rows.map(mapResult),
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    async findResultById(id, { includeDeleted = false } = {}) {
        const record = await prisma.result.findFirst({
            where: {
                id: Number(id),
                ...(includeDeleted ? {} : { deletedAt: null }),
            },
            select: resultListSelect,
        });
        return mapResult(record);
    }

    async findDuplicate({
        academicYearId,
        termId,
        classId,
        subjectId,
        studentId,
        excludeId = null,
    }) {
        return prisma.result.findFirst({
            where: {
                academicYearId,
                termId,
                classId,
                subjectId,
                studentId,
                deletedAt: null,
                ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
            },
            select: {
                id: true,
                isLocked: true,
                isPublished: true,
                isVerified: true,
                workflowStatus: true,
            },
        });
    }

    async findExistingForScope({ academicYearId, termId, classId, subjectId }) {
        return prisma.result.findMany({
            where: {
                academicYearId,
                termId,
                classId,
                subjectId,
                deletedAt: null,
            },
            select: {
                id: true,
                studentId: true,
                isLocked: true,
                isPublished: true,
                isVerified: true,
                workflowStatus: true,
            },
        });
    }

    async findResultsForClassTerm({ academicYearId, termId, classId }) {
        const rows = await prisma.result.findMany({
            where: {
                academicYearId,
                termId,
                classId,
                deletedAt: null,
                status: { not: "ARCHIVED" },
            },
            select: {
                id: true,
                studentId: true,
                subjectId: true,
                finalScore: true,
            },
        });
        return rows.map((row) => ({
            ...row,
            finalScore: toDecimalNumber(row.finalScore),
        }));
    }

    async createResult(data) {
        const created = await prisma.result.create({
            data: {
                academicYearId: data.academicYearId,
                termId: data.termId,
                classId: data.classId,
                subjectId: data.subjectId,
                studentId: data.studentId,
                examinationId: data.examinationId,
                caScore: data.caScore,
                examScore: data.examScore,
                caWeight: data.caWeight,
                examWeight: data.examWeight,
                finalScore: data.finalScore,
                gradeId: data.gradeId ?? null,
                remarks: data.remarks ?? null,
                subjectPosition: data.subjectPosition ?? null,
                classPosition: data.classPosition ?? null,
                subjectAverage: data.subjectAverage ?? null,
                classAverage: data.classAverage ?? null,
                isPassed: Boolean(data.isPassed),
                workflowStatus: data.workflowStatus || "GENERATED",
                isVerified: Boolean(data.isVerified),
                verifiedAt: data.verifiedAt ?? null,
                verifiedById: data.verifiedById ?? null,
                isPublished: Boolean(data.isPublished),
                publishedAt: data.publishedAt ?? null,
                publishedById: data.publishedById ?? null,
                isLocked: Boolean(data.isLocked),
                lockedAt: data.lockedAt ?? null,
                lockedById: data.lockedById ?? null,
                status: data.status || "ACTIVE",
            },
            select: resultListSelect,
        });
        return mapResult(created);
    }

    async updateResult(id, data) {
        const payload = {};
        for (const field of [
            "academicYearId",
            "termId",
            "classId",
            "subjectId",
            "studentId",
            "examinationId",
            "caScore",
            "examScore",
            "caWeight",
            "examWeight",
            "finalScore",
            "gradeId",
            "remarks",
            "subjectPosition",
            "classPosition",
            "subjectAverage",
            "classAverage",
            "isPassed",
            "workflowStatus",
            "isVerified",
            "verifiedAt",
            "verifiedById",
            "isPublished",
            "publishedAt",
            "publishedById",
            "isLocked",
            "lockedAt",
            "lockedById",
            "status",
        ]) {
            if (data[field] !== undefined) payload[field] = data[field];
        }

        const updated = await prisma.result.update({
            where: { id: Number(id) },
            data: payload,
            select: resultListSelect,
        });
        return mapResult(updated);
    }

    async upsertResult(data) {
        const existing = await this.findDuplicate(data);
        if (existing) {
            return this.updateResult(existing.id, {
                ...data,
                status: data.status || "ACTIVE",
            });
        }
        return this.createResult(data);
    }

    async softDeleteResult(id) {
        return mapResult(
            await prisma.result.update({
                where: { id: Number(id) },
                data: {
                    status: "ARCHIVED",
                    deletedAt: new Date(),
                },
                select: resultListSelect,
            })
        );
    }

    async restoreResult(id) {
        return mapResult(
            await prisma.result.update({
                where: { id: Number(id) },
                data: {
                    status: "ACTIVE",
                    deletedAt: null,
                },
                select: resultListSelect,
            })
        );
    }

    async setWorkflowState(ids, data = {}) {
        await prisma.result.updateMany({
            where: { id: { in: ids.map(Number) }, deletedAt: null },
            data,
        });
        const rows = await prisma.result.findMany({
            where: { id: { in: ids.map(Number) } },
            select: resultListSelect,
        });
        return rows.map(mapResult);
    }

    async setPublishState(ids, { isPublished, userId = null }) {
        const now = new Date();
        return this.setWorkflowState(
            ids,
            isPublished
                ? {
                      workflowStatus: "PUBLISHED",
                      isVerified: true,
                      isPublished: true,
                      publishedAt: now,
                      publishedById: userId,
                      isLocked: false,
                      lockedAt: null,
                      lockedById: null,
                  }
                : {
                      workflowStatus: "VERIFIED",
                      isVerified: true,
                      isPublished: false,
                      publishedAt: null,
                      publishedById: null,
                      isLocked: false,
                      lockedAt: null,
                      lockedById: null,
                  }
        );
    }

    async setLockState(ids, { isLocked, userId = null }) {
        const now = new Date();
        return this.setWorkflowState(
            ids,
            isLocked
                ? {
                      workflowStatus: "LOCKED",
                      isVerified: true,
                      isPublished: true,
                      // Preserve original publish metadata; only set lock fields.
                      isLocked: true,
                      lockedAt: now,
                      lockedById: userId,
                  }
                : {
                      workflowStatus: "PUBLISHED",
                      isVerified: true,
                      isPublished: true,
                      isLocked: false,
                      lockedAt: null,
                      lockedById: null,
                  }
        );
    }

    async setVerifyState(ids, { isVerified, userId = null }) {
        const now = new Date();
        return this.setWorkflowState(
            ids,
            isVerified
                ? {
                      workflowStatus: "VERIFIED",
                      isVerified: true,
                      verifiedAt: now,
                      verifiedById: userId,
                      isPublished: false,
                      publishedAt: null,
                      publishedById: null,
                      isLocked: false,
                      lockedAt: null,
                      lockedById: null,
                  }
                : {
                      workflowStatus: "GENERATED",
                      isVerified: false,
                      verifiedAt: null,
                      verifiedById: null,
                      isPublished: false,
                      publishedAt: null,
                      publishedById: null,
                      isLocked: false,
                      lockedAt: null,
                      lockedById: null,
                  }
        );
    }

    async findScopeResults({
        academicYearId,
        termId,
        classId,
        subjectId = null,
        studentId = null,
    }) {
        const where = {
            academicYearId: Number(academicYearId),
            termId: Number(termId),
            classId: Number(classId),
            deletedAt: null,
            status: { not: "ARCHIVED" },
        };
        if (subjectId) where.subjectId = Number(subjectId);
        if (studentId) where.studentId = Number(studentId);

        const rows = await prisma.result.findMany({
            where,
            select: resultListSelect,
            orderBy: [
                { student: { lastName: "asc" } },
                { student: { firstName: "asc" } },
                { subject: { subjectName: "asc" } },
            ],
        });
        return rows.map(mapResult);
    }

    async updatePositions(updates = []) {
        if (!updates.length) return;
        await prisma.$transaction(
            updates.map((item) =>
                prisma.result.update({
                    where: { id: Number(item.id) },
                    data: {
                        subjectPosition: item.subjectPosition ?? undefined,
                        classPosition: item.classPosition ?? undefined,
                        subjectAverage: item.subjectAverage ?? undefined,
                        classAverage: item.classAverage ?? undefined,
                    },
                })
            )
        );
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

    async findStudentById(id) {
        return prisma.student.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: studentSelect,
        });
    }

    async findExaminationById(id) {
        return prisma.examination.findFirst({
            where: { id: Number(id), deletedAt: null },
            select: {
                ...examinationSelect,
                scores: {
                    select: {
                        id: true,
                        studentId: true,
                        marks: true,
                        remarks: true,
                    },
                },
            },
        });
    }

    async findLockedExaminationForScope({
        academicYearId,
        termId,
        classId,
        subjectId,
        examinationId = null,
    }) {
        if (examinationId) {
            return this.findExaminationById(examinationId);
        }

        const preferredTypes = ["END_OF_TERM", "FINAL", "MID_TERM", "MOCK"];
        for (const examinationType of preferredTypes) {
            const exam = await prisma.examination.findFirst({
                where: {
                    academicYearId,
                    termId,
                    classId,
                    subjectId,
                    examinationType,
                    isLocked: true,
                    deletedAt: null,
                    status: "ACTIVE",
                },
                orderBy: { examinationDate: "desc" },
                select: {
                    ...examinationSelect,
                    scores: {
                        select: {
                            id: true,
                            studentId: true,
                            marks: true,
                            remarks: true,
                        },
                    },
                },
            });
            if (exam) return exam;
        }

        return prisma.examination.findFirst({
            where: {
                academicYearId,
                termId,
                classId,
                subjectId,
                isLocked: true,
                deletedAt: null,
                status: "ACTIVE",
            },
            orderBy: { examinationDate: "desc" },
            select: {
                ...examinationSelect,
                scores: {
                    select: {
                        id: true,
                        studentId: true,
                        marks: true,
                        remarks: true,
                    },
                },
            },
        });
    }

    async findAssessmentsForScope({ academicYearId, termId, classId, subjectId }) {
        return prisma.assessment.findMany({
            where: {
                academicYearId,
                termId,
                classId,
                subjectId,
                deletedAt: null,
                status: "ACTIVE",
            },
            select: {
                id: true,
                assessmentType: true,
                maxMarks: true,
                assessmentDate: true,
                scores: {
                    select: {
                        studentId: true,
                        marks: true,
                    },
                },
            },
        });
    }

    async findEnrolledStudents({ academicYearId, schoolClassId, termId }) {
        return prisma.enrollment.findMany({
            where: {
                academicYearId,
                schoolClassId,
                deletedAt: null,
                status: "ACTIVE",
                OR: [{ termId: null }, { termId }],
            },
            select: {
                id: true,
                enrollmentNumber: true,
                studentId: true,
                student: { select: studentSelect },
            },
            orderBy: [
                { student: { lastName: "asc" } },
                { student: { firstName: "asc" } },
            ],
        });
    }

    async findActiveClassSubject({ schoolClassId, subjectId, academicYearId, termId }) {
        return prisma.classSubject.findFirst({
            where: {
                schoolClassId,
                subjectId,
                academicYearId,
                termId,
                deletedAt: null,
                status: "ACTIVE",
            },
            select: { id: true },
        });
    }

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
            select: gradeSelect,
        });
        return rows.map((row) => ({
            ...row,
            minimumScore: toDecimalNumber(row.minimumScore),
            maximumScore: toDecimalNumber(row.maximumScore),
            gradePoint: toDecimalNumber(row.gradePoint),
        }));
    }

    async ensureDefaultGradeScale() {
        let scale = await prisma.gradeScale.findFirst({
            where: { isDefault: true, status: "ACTIVE" },
        });
        if (!scale) {
            scale = await prisma.gradeScale.findFirst({
                where: { name: "Standard Percentage" },
            });
        }
        if (!scale) {
            scale = await prisma.gradeScale.create({
                data: {
                    name: "Standard Percentage",
                    description: "Default A–F percentage banding for DIS-SMS results",
                    isDefault: true,
                    status: "ACTIVE",
                },
            });
        } else if (!scale.isDefault) {
            await prisma.gradeScale.update({
                where: { id: scale.id },
                data: { isDefault: true },
            });
        }

        const gradeCount = await prisma.grade.count({
            where: { status: "ACTIVE" },
        });
        if (gradeCount > 0) return scale;

        const defaults = [
            { grade: "A", minimumScore: 80, maximumScore: 100, gradePoint: 4.0, remarks: "Excellent", isPass: true, sortOrder: 1 },
            { grade: "B", minimumScore: 70, maximumScore: 79.99, gradePoint: 3.0, remarks: "Very Good", isPass: true, sortOrder: 2 },
            { grade: "C", minimumScore: 60, maximumScore: 69.99, gradePoint: 2.0, remarks: "Good", isPass: true, sortOrder: 3 },
            { grade: "D", minimumScore: 50, maximumScore: 59.99, gradePoint: 1.0, remarks: "Credit", isPass: true, sortOrder: 4 },
            { grade: "E", minimumScore: 40, maximumScore: 49.99, gradePoint: 0.5, remarks: "Pass", isPass: true, sortOrder: 5 },
            { grade: "F", minimumScore: 0, maximumScore: 39.99, gradePoint: 0, remarks: "Fail", isPass: false, sortOrder: 6 },
        ];

        await prisma.grade.createMany({
            data: defaults.map((item) => ({
                ...item,
                gradeScaleId: scale.id,
                description: `${item.grade} band`,
                status: "ACTIVE",
            })),
        });

        return scale;
    }

    async getSettingValue(key) {
        const setting = await prisma.systemSetting.findUnique({
            where: { settingKey: key },
            select: { settingValue: true, dataType: true },
        });
        return setting;
    }

    async getStats({
        academicYearId = null,
        termId = null,
        classId = null,
        subjectId = null,
        studentId = null,
        scope = "overview",
    } = {}) {
        const where = {
            deletedAt: null,
            status: { not: "ARCHIVED" },
        };
        if (academicYearId) where.academicYearId = academicYearId;
        if (termId) where.termId = termId;
        if (classId) where.classId = classId;
        if (subjectId) where.subjectId = subjectId;
        if (studentId) where.studentId = studentId;

        const rows = await prisma.result.findMany({
            where,
            select: {
                id: true,
                finalScore: true,
                caScore: true,
                examScore: true,
                isPassed: true,
                workflowStatus: true,
                isVerified: true,
                isPublished: true,
                isLocked: true,
                classId: true,
                subjectId: true,
                studentId: true,
                gradeId: true,
                schoolClass: { select: { id: true, className: true, classCode: true } },
                subject: { select: { id: true, subjectName: true, subjectCode: true } },
                student: {
                    select: {
                        id: true,
                        admissionNo: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                grade: { select: { id: true, grade: true } },
            },
        });

        const mapped = rows.map((row) => ({
            ...row,
            finalScore: toDecimalNumber(row.finalScore) || 0,
            caScore: toDecimalNumber(row.caScore) || 0,
            examScore: toDecimalNumber(row.examScore) || 0,
        }));

        const overview = {
            results: mapped.length,
            generated: mapped.filter((r) => r.workflowStatus === "GENERATED").length,
            verified: mapped.filter((r) => r.isVerified).length,
            published: mapped.filter((r) => r.isPublished).length,
            locked: mapped.filter((r) => r.isLocked).length,
            passed: mapped.filter((r) => r.isPassed).length,
            failed: mapped.filter((r) => !r.isPassed).length,
            byWorkflow: {
                DRAFT: mapped.filter((r) => r.workflowStatus === "DRAFT").length,
                GENERATED: mapped.filter((r) => r.workflowStatus === "GENERATED").length,
                VERIFIED: mapped.filter((r) => r.workflowStatus === "VERIFIED").length,
                PUBLISHED: mapped.filter((r) => r.workflowStatus === "PUBLISHED").length,
                LOCKED: mapped.filter((r) => r.workflowStatus === "LOCKED").length,
            },

            averageFinalScore: mapped.length
                ? Math.round(
                      (mapped.reduce((sum, r) => sum + r.finalScore, 0) / mapped.length) * 10
                  ) / 10
                : 0,
            averageCaScore: mapped.length
                ? Math.round(
                      (mapped.reduce((sum, r) => sum + r.caScore, 0) / mapped.length) * 10
                  ) / 10
                : 0,
            averageExamScore: mapped.length
                ? Math.round(
                      (mapped.reduce((sum, r) => sum + r.examScore, 0) / mapped.length) * 10
                  ) / 10
                : 0,
            passRate: mapped.length
                ? Math.round(
                      (mapped.filter((r) => r.isPassed).length / mapped.length) * 1000
                  ) / 10
                : 0,
        };

        const groupBy = (keyFn, labelFn) => {
            const map = new Map();
            for (const row of mapped) {
                const key = keyFn(row);
                if (!map.has(key)) {
                    map.set(key, {
                        key,
                        label: labelFn(row),
                        results: 0,
                        passed: 0,
                        failed: 0,
                        totalFinal: 0,
                    });
                }
                const bucket = map.get(key);
                bucket.results += 1;
                bucket.passed += row.isPassed ? 1 : 0;
                bucket.failed += row.isPassed ? 0 : 1;
                bucket.totalFinal += row.finalScore;
            }
            return Array.from(map.values())
                .map((item) => ({
                    ...item,
                    averageFinalScore:
                        item.results > 0
                            ? Math.round((item.totalFinal / item.results) * 10) / 10
                            : 0,
                    passRate:
                        item.results > 0
                            ? Math.round((item.passed / item.results) * 1000) / 10
                            : 0,
                }))
                .sort((a, b) => b.results - a.results);
        };

        const payload = { overview, scope };
        if (scope === "class") {
            payload.byClass = groupBy(
                (r) => r.classId,
                (r) =>
                    r.schoolClass
                        ? `${r.schoolClass.className} (${r.schoolClass.classCode})`
                        : `Class #${r.classId}`
            );
        } else if (scope === "subject") {
            payload.bySubject = groupBy(
                (r) => r.subjectId,
                (r) =>
                    r.subject
                        ? `${r.subject.subjectName} (${r.subject.subjectCode})`
                        : `Subject #${r.subjectId}`
            );
        } else if (scope === "student") {
            payload.byStudent = groupBy(
                (r) => r.studentId,
                (r) =>
                    r.student
                        ? `${r.student.lastName}, ${r.student.firstName} (${r.student.admissionNo})`
                        : `Student #${r.studentId}`
            );
        } else if (scope === "grade") {
            payload.byGrade = groupBy(
                (r) => r.grade?.grade || "Ungraded",
                (r) => r.grade?.grade || "Ungraded"
            );
        }

        return payload;
    }
}

module.exports = new ResultRepository();
