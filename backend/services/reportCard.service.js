// services/reportCard.service.js
// Report Cards Engine — generate snapshots from published Results only

const reportCardRepository = require("../repositories/reportCard.repository");
const templates = require("./reportCardTemplates");
const {
    BadRequestError,
    NotFoundError,
    ConflictError,
    BusinessRuleError,
    ForbiddenError,
} = require("../errors");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const SUMMARY_SCOPES = ["overview", "class"];
const PROMOTION_VALUES = [
    "PENDING",
    "PROMOTED",
    "PROMOTED_ON_PROBATION",
    "REPEAT",
    "GRADUATED",
    "WITHDRAWN",
    "TRANSFERRED",
];
const DEFAULT_TEMPLATE = "STANDARD_A4";

const VERIFY_ROLES = new Set(["Administrator", "Headmaster", "Registrar"]);
const ADMIN_ROLE = "Administrator";

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;
const round1 = (value) => Math.round(Number(value || 0) * 10) / 10;

function parseBool(value) {
    if (value === undefined || value === null || value === "") return null;
    if (["true", true, "1", 1].includes(value)) return true;
    if (["false", false, "0", 0].includes(value)) return false;
    return null;
}

function roleName(user) {
    return user?.role?.name || null;
}

function isAdmin(user) {
    return roleName(user) === ADMIN_ROLE;
}

function canVerify(user) {
    return VERIFY_ROLES.has(roleName(user));
}

function isReleased(card) {
    return Boolean(
        card?.isPublished ||
            card?.isLocked ||
            ["PUBLISHED", "LOCKED"].includes(card?.workflowStatus)
    );
}

function flagsFromWorkflow(status, { userId = null, keepTimestamps = false, existing = null } = {}) {
    const now = new Date();
    const next = {
        workflowStatus: status,
        isVerified: ["VERIFIED", "PUBLISHED", "LOCKED"].includes(status),
        isPublished: ["PUBLISHED", "LOCKED"].includes(status),
        isLocked: status === "LOCKED",
    };

    if (status === "GENERATED" || status === "DRAFT") {
        next.verifiedAt = null;
        next.verifiedById = null;
        next.publishedAt = null;
        next.publishedById = null;
        next.lockedAt = null;
        next.lockedById = null;
    } else if (status === "VERIFIED") {
        next.verifiedAt = keepTimestamps && existing?.verifiedAt ? existing.verifiedAt : now;
        next.verifiedById =
            keepTimestamps && existing?.verifiedById ? existing.verifiedById : userId;
        next.publishedAt = null;
        next.publishedById = null;
        next.lockedAt = null;
        next.lockedById = null;
    } else if (status === "PUBLISHED") {
        next.verifiedAt = existing?.verifiedAt || now;
        next.verifiedById = existing?.verifiedById || userId;
        next.publishedAt = keepTimestamps && existing?.publishedAt ? existing.publishedAt : now;
        next.publishedById =
            keepTimestamps && existing?.publishedById ? existing.publishedById : userId;
        next.lockedAt = null;
        next.lockedById = null;
    } else if (status === "LOCKED") {
        next.verifiedAt = existing?.verifiedAt || now;
        next.verifiedById = existing?.verifiedById || userId;
        next.publishedAt = existing?.publishedAt || now;
        next.publishedById = existing?.publishedById || userId;
        next.lockedAt = keepTimestamps && existing?.lockedAt ? existing.lockedAt : now;
        next.lockedById = keepTimestamps && existing?.lockedById ? existing.lockedById : userId;
    }

    return next;
}

function resolveOverallGrade(average, grades = []) {
    const score = Number(average);
    if (Number.isNaN(score)) return null;
    const band = grades.find((g) => {
        const min = Number(g.minimumScore);
        const max = Number(g.maximumScore);
        return score >= min && score <= max;
    });
    if (band?.grade) return band.grade;
    // Fallback to lowest band when score falls through gaps (Results Engine parity).
    return grades[grades.length - 1]?.grade || null;
}

function classTeacherName(schoolClass) {
    const teacher = schoolClass?.classTeacher;
    if (!teacher) return null;
    return [teacher.firstName, teacher.lastName].filter(Boolean).join(" ");
}

class ReportCardService {
    assertNotReleased(card, user, action = "modify") {
        if (isReleased(card) && !isAdmin(user)) {
            throw new ForbiddenError(
                `Published or locked report cards can only be ${action} by an Administrator.`
            );
        }
    }

    async getReportCards(query = {}) {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 20, 100);
        const search = query.search || query.keyword || "";

        return reportCardRepository.findReportCards({
            page,
            limit,
            search,
            academicYearId: Number(query.academicYearId) || null,
            termId: Number(query.termId) || null,
            classId: Number(query.classId) || null,
            studentId: Number(query.studentId) || null,
            status: query.status || null,
            isVerified: parseBool(query.isVerified),
            isPublished: parseBool(query.isPublished),
            isLocked: parseBool(query.isLocked),
            workflowStatus: query.workflowStatus
                ? String(query.workflowStatus).toUpperCase()
                : null,
            promotionDecision: query.promotionDecision
                ? String(query.promotionDecision).toUpperCase()
                : null,
            templateKey: query.templateKey || null,
            sortBy: query.sortBy || "createdAt",
            sortOrder: query.sortOrder || "desc",
        });
    }

    async getArchivedReportCards(query = {}) {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 20, 100);
        return reportCardRepository.findReportCards({
            page,
            limit,
            search: query.search || query.keyword || "",
            academicYearId: Number(query.academicYearId) || null,
            termId: Number(query.termId) || null,
            classId: Number(query.classId) || null,
            includeDeleted: true,
            sortBy: query.sortBy || "updatedAt",
            sortOrder: query.sortOrder || "desc",
        });
    }

    async getReportCardById(id) {
        const card = await reportCardRepository.findReportCardById(id);
        if (!card || (card.deletedAt && card.status === "ARCHIVED")) {
            throw new NotFoundError("Report card not found.");
        }
        return card;
    }

    async getPreview(id) {
        const card = await this.getReportCardById(id);
        return templates.buildRenderModel(card);
    }

    async getTemplates() {
        return templates.listTemplates();
    }

    async getStats(query = {}) {
        const scope = String(query.scope || "overview").toLowerCase();
        if (!SUMMARY_SCOPES.includes(scope)) {
            throw new BadRequestError(
                `Summary scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`
            );
        }

        const filters = {
            academicYearId: Number(query.academicYearId) || null,
            termId: Number(query.termId) || null,
            classId: Number(query.classId) || null,
        };

        if (scope === "class") {
            return {
                scope,
                filters,
                classes: await reportCardRepository.getClassBreakdown(filters),
                overview: await reportCardRepository.getOverviewStats(filters),
            };
        }

        return {
            scope: "overview",
            filters,
            overview: await reportCardRepository.getOverviewStats(filters),
        };
    }

    /**
     * Compose an immutable academic snapshot from published results + attendance + school profile.
     */
    async buildSnapshot({
        student,
        academicYear,
        term,
        schoolClass,
        results,
        attendance,
        school,
        photoUrl,
        grades,
        teacherRemarks = null,
        headmasterRemarks = null,
        promotionDecision = "PENDING",
        promoted = false,
        templateKey = DEFAULT_TEMPLATE,
    }) {
        const scores = results.map((r) => Number(r.finalScore || 0));
        const totalScore = round2(scores.reduce((sum, v) => sum + v, 0));
        const averageScore = scores.length ? round1(totalScore / scores.length) : 0;
        const overallGrade = resolveOverallGrade(averageScore, grades);
        const classPosition = results[0]?.classPosition ?? null;
        const classAverage = results[0]?.classAverage ?? null;
        const passedCount = results.filter((r) => r.isPassed).length;
        const failedCount = results.length - passedCount;

        const subjects = results.map((row) => ({
            resultId: row.id,
            subjectId: row.subjectId,
            subjectCode: row.subject?.subjectCode || null,
            subjectName: row.subject?.subjectName || null,
            examinationId: row.examinationId,
            examinationName: row.examination?.name || null,
            caScore: row.caScore,
            examScore: row.examScore,
            caWeight: row.caWeight,
            examWeight: row.examWeight,
            finalScore: row.finalScore,
            gradeId: row.gradeId,
            gradeLetter: row.gradeLetter || row.grade?.grade || null,
            gradePoint: row.gradePoint ?? null,
            gradeRemarks: row.grade?.remarks || null,
            remarks: row.remarks || null,
            subjectPosition: row.subjectPosition,
            classPosition: row.classPosition,
            subjectAverage: row.subjectAverage,
            classAverage: row.classAverage,
            isPassed: Boolean(row.isPassed),
            workflowStatus: row.workflowStatus,
        }));

        return {
            templateKey,
            version: 1,
            generatedAt: new Date().toISOString(),
            school: school
                ? {
                      schoolName: school.schoolName,
                      schoolCode: school.schoolCode,
                      motto: school.motto,
                      address: school.address,
                      city: school.city,
                      region: school.region,
                      country: school.country,
                      phone: school.phone,
                      email: school.email,
                      website: school.website,
                      logoUrl: school.logoUrl,
                      stampUrl: school.stampUrl,
                      accreditationInfo: school.accreditationInfo,
                      establishedYear: school.establishedYear,
                  }
                : null,
            student: {
                id: student.id,
                admissionNo: student.admissionNo,
                firstName: student.firstName,
                lastName: student.lastName,
                otherName: student.otherName,
                gender: student.gender,
                dateOfBirth: student.dateOfBirth,
                photoUrl,
            },
            academic: {
                academicYearId: academicYear.id,
                academicYearName: academicYear.name,
                termId: term.id,
                termName: term.name,
                termCode: term.code,
                classId: schoolClass.id,
                className: schoolClass.className,
                classCode: schoolClass.classCode,
                classTeacherId: schoolClass.classTeacherId || null,
                classTeacherName: classTeacherName(schoolClass),
            },
            subjects,
            summary: {
                subjectCount: subjects.length,
                totalScore,
                averageScore,
                overallGrade,
                classPosition,
                classAverage,
                passedCount,
                failedCount,
            },
            attendance: {
                daysPresent: attendance.daysPresent,
                daysAbsent: attendance.daysAbsent,
                daysLate: attendance.daysLate,
                daysExcused: attendance.daysExcused,
                totalDays: attendance.totalDays,
                attendancePercentage: attendance.attendancePercentage,
            },
            remarks: {
                teacher: teacherRemarks,
                headmaster: headmasterRemarks,
            },
            promotion: {
                decision: promotionDecision,
                promoted,
            },
        };
    }

    async composeCardPayload({
        studentId,
        academicYearId,
        termId,
        classId = null,
        teacherRemarks = null,
        headmasterRemarks = null,
        promotionDecision = "PENDING",
        promoted = null,
        templateKey = DEFAULT_TEMPLATE,
        user = null,
        asDraft = false,
    }) {
        templates.resolveTemplate(templateKey);

        const student = await reportCardRepository.findStudentById(studentId);
        if (!student) throw new NotFoundError("Student not found.");

        const academicYear = await reportCardRepository.findAcademicYearById(academicYearId);
        if (!academicYear) throw new NotFoundError("Academic year not found.");

        const term = await reportCardRepository.findTermById(termId);
        if (!term) throw new NotFoundError("Term not found.");
        if (term.academicYearId !== academicYearId) {
            throw new BadRequestError("Term does not belong to the selected academic year.");
        }

        const resolvedClassId = classId || student.classId;
        const schoolClass = await reportCardRepository.findClassById(resolvedClassId);
        if (!schoolClass) throw new NotFoundError("Class not found.");

        const results = await reportCardRepository.findPublishedResultsForStudent({
            studentId,
            academicYearId,
            termId,
            classId: resolvedClassId,
        });

        if (!results.length) {
            throw new BusinessRuleError(
                "No published results found for this student in the selected year/term. Publish results before generating a report card."
            );
        }

        const unpublishedGuard = results.every(
            (r) => r.isPublished || r.isLocked || ["PUBLISHED", "LOCKED"].includes(r.workflowStatus)
        );
        if (!unpublishedGuard) {
            throw new BusinessRuleError(
                "Report cards can only be generated from published or locked results."
            );
        }

        const [attendance, school, photoUrl] = await Promise.all([
            reportCardRepository.findAttendanceSummary({
                studentId,
                academicYearId,
                termId,
            }),
            reportCardRepository.findSchoolProfile(),
            reportCardRepository.findStudentPhotoUrl(studentId),
        ]);

        await reportCardRepository.ensureDefaultGradeScale();
        const grades = await reportCardRepository.findActiveGrades();
        if (!grades.length) {
            throw new BusinessRuleError(
                "No active grade bands are configured. Configure grades or grade scales first."
            );
        }

        const decision = String(promotionDecision || "PENDING").toUpperCase();
        if (!PROMOTION_VALUES.includes(decision)) {
            throw new BadRequestError(
                `Promotion decision must be one of: ${PROMOTION_VALUES.join(", ")}.`
            );
        }
        const isPromoted =
            promoted === null || promoted === undefined
                ? ["PROMOTED", "PROMOTED_ON_PROBATION"].includes(decision)
                : Boolean(promoted);

        const snapshot = await this.buildSnapshot({
            student,
            academicYear,
            term,
            schoolClass,
            results,
            attendance,
            school,
            photoUrl,
            grades,
            teacherRemarks,
            headmasterRemarks,
            promotionDecision: decision,
            promoted: isPromoted,
            templateKey,
        });

        const workflow = flagsFromWorkflow(asDraft ? "DRAFT" : "GENERATED", {
            userId: user?.id || null,
        });

        return {
            studentId,
            academicYearId,
            termId,
            classId: resolvedClassId,
            templateKey,
            snapshot,
            totalScore: snapshot.summary.totalScore,
            averageScore: snapshot.summary.averageScore,
            overallGrade: snapshot.summary.overallGrade,
            classPosition: snapshot.summary.classPosition,
            subjectCount: snapshot.summary.subjectCount,
            passedCount: snapshot.summary.passedCount,
            failedCount: snapshot.summary.failedCount,
            daysPresent: attendance.daysPresent,
            daysAbsent: attendance.daysAbsent,
            daysLate: attendance.daysLate,
            daysExcused: attendance.daysExcused,
            attendancePercentage: attendance.attendancePercentage,
            teacherRemarks: teacherRemarks || null,
            headmasterRemarks: headmasterRemarks || null,
            promotionDecision: decision,
            promoted: isPromoted,
            generatedAt: new Date(),
            generatedById: user?.id || null,
            ...workflow,
            status: "ACTIVE",
            deletedAt: null,
        };
    }

    async generateReportCard(rawData = {}, user = null) {
        const studentId = Number(rawData.studentId);
        const academicYearId = Number(rawData.academicYearId);
        const termId = Number(rawData.termId);
        const classId = Number(rawData.classId) || null;

        if (!studentId || !academicYearId || !termId) {
            throw new BadRequestError(
                "studentId, academicYearId, and termId are required to generate a report card."
            );
        }

        const regenerate = Boolean(rawData.regenerate);

        // Prefer an active card; otherwise revive an archived row for the same unique scope.
        let existing = await reportCardRepository.findReportCardByScope(
            studentId,
            academicYearId,
            termId
        );
        if (!existing) {
            existing = await reportCardRepository.findReportCardByScope(
                studentId,
                academicYearId,
                termId,
                { includeDeleted: true }
            );
        }

        const isArchived = Boolean(existing?.deletedAt || existing?.status === "ARCHIVED");

        if (existing && !isArchived && !regenerate) {
            throw new ConflictError(
                "A report card already exists for this student/term. Pass regenerate=true to rebuild from published results."
            );
        }

        if (existing && isReleased(existing) && !isAdmin(user)) {
            throw new ForbiddenError(
                "Published or locked report cards can only be regenerated by an Administrator."
            );
        }

        const payload = await this.composeCardPayload({
            studentId,
            academicYearId,
            termId,
            classId,
            teacherRemarks: rawData.teacherRemarks ?? existing?.teacherRemarks ?? null,
            headmasterRemarks:
                rawData.headmasterRemarks ?? existing?.headmasterRemarks ?? null,
            promotionDecision:
                rawData.promotionDecision ?? existing?.promotionDecision ?? "PENDING",
            promoted: rawData.promoted !== undefined ? parseBool(rawData.promoted) : null,
            templateKey: rawData.templateKey || existing?.templateKey || DEFAULT_TEMPLATE,
            user,
            asDraft: Boolean(rawData.asDraft),
        });

        if (existing) {
            const card = await reportCardRepository.updateReportCard(existing.id, {
                ...payload,
                status: "ACTIVE",
                deletedAt: null,
            });
            return { card, created: false };
        }

        const card = await reportCardRepository.createReportCard(payload);
        return { card, created: true };
    }

    async generateBulk(rawData = {}, user = null) {
        const academicYearId = Number(rawData.academicYearId);
        const termId = Number(rawData.termId);
        const classId = Number(rawData.classId);

        if (!academicYearId || !termId || !classId) {
            throw new BadRequestError(
                "academicYearId, termId, and classId are required for bulk report card generation."
            );
        }

        const enrollments = await reportCardRepository.findEnrolledStudents({
            academicYearId,
            classId,
        });

        if (!enrollments.length) {
            throw new BusinessRuleError(
                "No enrolled students found for the selected class and academic year."
            );
        }

        const regenerate = Boolean(rawData.regenerate);
        const created = [];
        const updated = [];
        const skipped = [];
        const errors = [];

        for (const enrollment of enrollments) {
            const studentId = enrollment.studentId;
            try {
                const existing = await reportCardRepository.findReportCardByScope(
                    studentId,
                    academicYearId,
                    termId,
                    { includeDeleted: true }
                );
                const isActive = existing && !existing.deletedAt && existing.status !== "ARCHIVED";

                if (isActive && !regenerate) {
                    skipped.push({
                        studentId,
                        reason: "Report card already exists (pass regenerate=true).",
                    });
                    continue;
                }

                if (existing && isReleased(existing) && !isAdmin(user)) {
                    skipped.push({
                        studentId,
                        reason: "Report card is published or locked.",
                    });
                    continue;
                }

                const result = await this.generateReportCard(
                    {
                        studentId,
                        academicYearId,
                        termId,
                        classId,
                        teacherRemarks: rawData.teacherRemarks,
                        headmasterRemarks: rawData.headmasterRemarks,
                        promotionDecision: rawData.promotionDecision,
                        promoted: rawData.promoted,
                        templateKey: rawData.templateKey,
                        regenerate: true,
                        asDraft: Boolean(rawData.asDraft),
                    },
                    user
                );

                if (result.created) created.push(result.card);
                else updated.push(result.card);
            } catch (error) {
                errors.push({
                    studentId,
                    message: error.message || "Failed to generate report card.",
                });
            }
        }

        return {
            meta: {
                requested: enrollments.length,
                created: created.length,
                updated: updated.length,
                skipped: skipped.length,
                failed: errors.length,
            },
            created,
            updated,
            skipped,
            errors,
        };
    }

    async updateReportCard(id, rawData = {}, user = null) {
        const card = await reportCardRepository.findReportCardById(id);
        if (!card || card.deletedAt) {
            throw new NotFoundError("Report card not found.");
        }
        this.assertNotReleased(card, user, "updated");

        const data = {};
        if (rawData.teacherRemarks !== undefined) {
            data.teacherRemarks =
                rawData.teacherRemarks === null
                    ? null
                    : String(rawData.teacherRemarks).trim() || null;
        }
        if (rawData.headmasterRemarks !== undefined) {
            data.headmasterRemarks =
                rawData.headmasterRemarks === null
                    ? null
                    : String(rawData.headmasterRemarks).trim() || null;
        }
        if (rawData.promotionDecision !== undefined) {
            const decision = String(rawData.promotionDecision).toUpperCase();
            if (!PROMOTION_VALUES.includes(decision)) {
                throw new BadRequestError(
                    `Promotion decision must be one of: ${PROMOTION_VALUES.join(", ")}.`
                );
            }
            data.promotionDecision = decision;
            if (rawData.promoted === undefined) {
                data.promoted = decision === "PROMOTED";
            }
        }
        if (rawData.promoted !== undefined) {
            data.promoted = Boolean(parseBool(rawData.promoted));
        }
        if (rawData.templateKey !== undefined) {
            templates.resolveTemplate(rawData.templateKey);
            data.templateKey = String(rawData.templateKey).toUpperCase();
        }
        if (rawData.status !== undefined) {
            const status = String(rawData.status).toUpperCase();
            if (!STATUS_VALUES.includes(status)) {
                throw new BadRequestError("Status must be ACTIVE or INACTIVE.");
            }
            data.status = status;
        }

        // Keep snapshot remarks/promotion in sync when editing metadata
        if (
            data.teacherRemarks !== undefined ||
            data.headmasterRemarks !== undefined ||
            data.promotionDecision !== undefined ||
            data.promoted !== undefined
        ) {
            const snapshot = { ...(card.snapshot || {}) };
            snapshot.remarks = {
                teacher:
                    data.teacherRemarks !== undefined
                        ? data.teacherRemarks
                        : card.teacherRemarks,
                headmaster:
                    data.headmasterRemarks !== undefined
                        ? data.headmasterRemarks
                        : card.headmasterRemarks,
            };
            snapshot.promotion = {
                decision:
                    data.promotionDecision !== undefined
                        ? data.promotionDecision
                        : card.promotionDecision,
                promoted:
                    data.promoted !== undefined ? data.promoted : card.promoted,
            };
            data.snapshot = snapshot;
        }

        if (rawData.refreshSnapshot) {
            this.assertNotReleased(card, user, "refreshed");
            const refreshed = await this.composeCardPayload({
                studentId: card.studentId,
                academicYearId: card.academicYearId,
                termId: card.termId,
                classId: card.classId,
                teacherRemarks:
                    data.teacherRemarks !== undefined
                        ? data.teacherRemarks
                        : card.teacherRemarks,
                headmasterRemarks:
                    data.headmasterRemarks !== undefined
                        ? data.headmasterRemarks
                        : card.headmasterRemarks,
                promotionDecision:
                    data.promotionDecision !== undefined
                        ? data.promotionDecision
                        : card.promotionDecision,
                promoted: data.promoted !== undefined ? data.promoted : card.promoted,
                templateKey: data.templateKey || card.templateKey,
                user,
            });
            Object.assign(data, {
                snapshot: refreshed.snapshot,
                totalScore: refreshed.totalScore,
                averageScore: refreshed.averageScore,
                overallGrade: refreshed.overallGrade,
                classPosition: refreshed.classPosition,
                subjectCount: refreshed.subjectCount,
                passedCount: refreshed.passedCount,
                failedCount: refreshed.failedCount,
                daysPresent: refreshed.daysPresent,
                daysAbsent: refreshed.daysAbsent,
                daysLate: refreshed.daysLate,
                daysExcused: refreshed.daysExcused,
                attendancePercentage: refreshed.attendancePercentage,
                generatedAt: refreshed.generatedAt,
                generatedById: refreshed.generatedById,
            });
        }

        return reportCardRepository.updateReportCard(id, data);
    }

    async archiveReportCard(id, user = null) {
        const card = await reportCardRepository.findReportCardById(id);
        if (!card || card.deletedAt) {
            throw new NotFoundError("Report card not found.");
        }
        this.assertNotReleased(card, user, "archived");
        return reportCardRepository.softDeleteReportCard(id);
    }

    async restoreReportCard(id) {
        const card = await reportCardRepository.findReportCardById(id);
        if (!card) throw new NotFoundError("Report card not found.");
        if (!card.deletedAt && card.status !== "ARCHIVED") {
            throw new BadRequestError("Report card is not archived.");
        }

        const duplicate = await reportCardRepository.findReportCardByScope(
            card.studentId,
            card.academicYearId,
            card.termId,
            { excludeId: card.id }
        );
        if (duplicate) {
            throw new ConflictError(
                "An active report card already exists for this student and term."
            );
        }

        return reportCardRepository.restoreReportCard(id);
    }

    async resolveScopeIds(rawData = {}) {
        if (Array.isArray(rawData.ids) && rawData.ids.length) {
            return rawData.ids.map(Number).filter(Boolean);
        }
        const academicYearId = Number(rawData.academicYearId) || null;
        const termId = Number(rawData.termId) || null;
        const classId = Number(rawData.classId) || null;
        if (!academicYearId || !termId) {
            throw new BadRequestError(
                "Provide ids[] or academicYearId + termId (optional classId) for bulk workflow actions."
            );
        }
        return reportCardRepository.findIdsByScope({
            academicYearId,
            termId,
            classId,
        });
    }

    async applyWorkflow(rawData, user, {
        fromStatuses,
        toStatus,
        requireRoleCheck,
        actionLabel,
        skipCheck = null,
    }) {
        if (requireRoleCheck && !requireRoleCheck(user)) {
            throw new ForbiddenError(`You are not allowed to ${actionLabel} report cards.`);
        }

        const ids = await this.resolveScopeIds(rawData);
        if (!ids.length) {
            throw new BusinessRuleError("No report cards matched the given scope.");
        }

        const cards = await Promise.all(
            ids.map((id) => reportCardRepository.findReportCardById(id))
        );
        const eligible = [];
        const skipped = [];

        for (const card of cards) {
            if (!card || card.deletedAt) {
                skipped.push({ id: card?.id, reason: "Not found or archived." });
                continue;
            }
            if (typeof skipCheck === "function") {
                const reason = skipCheck(card, user);
                if (reason) {
                    skipped.push({ id: card.id, reason });
                    continue;
                }
            }
            if (!fromStatuses.includes(card.workflowStatus)) {
                skipped.push({
                    id: card.id,
                    reason: `Current status ${card.workflowStatus} cannot transition to ${toStatus}.`,
                });
                continue;
            }
            eligible.push(card);
        }

        if (!eligible.length) {
            throw new BusinessRuleError(
                `No report cards were eligible to ${actionLabel}.`
            );
        }

        for (const card of eligible) {
            const flags = flagsFromWorkflow(toStatus, {
                userId: user?.id || null,
                existing: card,
                keepTimestamps: toStatus === "LOCKED" || toStatus === "PUBLISHED",
            });
            await reportCardRepository.updateReportCard(card.id, flags);
        }

        return {
            meta: {
                requested: ids.length,
                updated: eligible.length,
                skipped: skipped.length,
                workflowStatus: toStatus,
            },
            updatedIds: eligible.map((c) => c.id),
            skipped,
        };
    }

    async verifyReportCards(rawData = {}, user = null) {
        return this.applyWorkflow(rawData, user, {
            fromStatuses: ["DRAFT", "GENERATED"],
            toStatus: "VERIFIED",
            requireRoleCheck: canVerify,
            actionLabel: "verify",
        });
    }

    async unverifyReportCards(rawData = {}, user = null) {
        if (!isAdmin(user)) {
            throw new ForbiddenError("Only an Administrator can unverify report cards.");
        }
        return this.applyWorkflow(rawData, user, {
            fromStatuses: ["VERIFIED"],
            toStatus: "GENERATED",
            requireRoleCheck: isAdmin,
            actionLabel: "unverify",
            skipCheck: (card) => {
                if (card.isLocked || card.workflowStatus === "LOCKED") {
                    return "Unlock before unverifying.";
                }
                if (card.isPublished || card.workflowStatus === "PUBLISHED") {
                    return "Unpublish before unverifying.";
                }
                return null;
            },
        });
    }

    async publishReportCards(rawData = {}, user = null) {
        return this.applyWorkflow(rawData, user, {
            fromStatuses: isAdmin(user)
                ? ["DRAFT", "GENERATED", "VERIFIED"]
                : ["VERIFIED"],
            toStatus: "PUBLISHED",
            requireRoleCheck: () => true,
            actionLabel: "publish",
            skipCheck: (card) => {
                if (card.isLocked || card.workflowStatus === "LOCKED") {
                    return "Report card is locked.";
                }
                if (card.isPublished || card.workflowStatus === "PUBLISHED") {
                    return "Already published.";
                }
                return null;
            },
        });
    }

    async unpublishReportCards(rawData = {}, user = null) {
        if (!isAdmin(user)) {
            throw new ForbiddenError("Only an Administrator can unpublish report cards.");
        }
        return this.applyWorkflow(rawData, user, {
            fromStatuses: ["PUBLISHED"],
            toStatus: "VERIFIED",
            requireRoleCheck: isAdmin,
            actionLabel: "unpublish",
            skipCheck: (card) => {
                if (card.isLocked || card.workflowStatus === "LOCKED") {
                    return "Unlock before unpublishing.";
                }
                return null;
            },
        });
    }

    async lockReportCards(rawData = {}, user = null) {
        return this.applyWorkflow(rawData, user, {
            fromStatuses: isAdmin(user) ? ["VERIFIED", "PUBLISHED"] : ["PUBLISHED"],
            toStatus: "LOCKED",
            requireRoleCheck: () => true,
            actionLabel: "lock",
            skipCheck: (card) => {
                if (card.isLocked || card.workflowStatus === "LOCKED") {
                    return "Already locked.";
                }
                return null;
            },
        });
    }

    async unlockReportCards(rawData = {}, user = null) {
        if (!isAdmin(user)) {
            throw new ForbiddenError("Only an Administrator can unlock report cards.");
        }
        return this.applyWorkflow(rawData, user, {
            fromStatuses: ["LOCKED"],
            toStatus: "PUBLISHED",
            requireRoleCheck: isAdmin,
            actionLabel: "unlock",
        });
    }
}

module.exports = new ReportCardService();
