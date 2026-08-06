// services/studentPromotion.service.js
// Student Promotion & Graduation — recommend → approve → execute

const studentPromotionRepository = require("../repositories/studentPromotion.repository");
const {
    BadRequestError,
    NotFoundError,
    ConflictError,
    BusinessRuleError,
    ForbiddenError,
} = require("../errors");
const { toDate } = require("../utils/date");

const DECISION_VALUES = [
    "PENDING",
    "PROMOTED",
    "PROMOTED_ON_PROBATION",
    "REPEAT",
    "GRADUATED",
    "WITHDRAWN",
    "TRANSFERRED",
];

const EXECUTABLE_DECISIONS = new Set([
    "PROMOTED",
    "PROMOTED_ON_PROBATION",
    "REPEAT",
    "GRADUATED",
    "WITHDRAWN",
    "TRANSFERRED",
]);

const CONTINUATION_DECISIONS = new Set([
    "PROMOTED",
    "PROMOTED_ON_PROBATION",
    "REPEAT",
]);

const EXIT_DECISIONS = new Set(["GRADUATED", "WITHDRAWN", "TRANSFERRED"]);

const WORKFLOW_VALUES = ["DRAFT", "APPROVED", "EXECUTED", "CANCELLED"];
const SUMMARY_SCOPES = ["overview", "class"];

const APPROVE_ROLES = new Set(["Administrator", "Headmaster", "Registrar"]);
const EXECUTE_ROLES = new Set(["Administrator", "Headmaster", "Registrar"]);
const ADMIN_ROLE = "Administrator";

function roleName(user) {
    return user?.role?.name || null;
}

function isAdmin(user) {
    return roleName(user) === ADMIN_ROLE;
}

function parseBool(value) {
    if (value === undefined || value === null || value === "") return null;
    if (["true", true, "1", 1].includes(value)) return true;
    if (["false", false, "0", 0].includes(value)) return false;
    return null;
}

function assertDecision(decision) {
    const value = String(decision || "").toUpperCase();
    if (!DECISION_VALUES.includes(value)) {
        throw new BadRequestError(
            `Promotion decision must be one of: ${DECISION_VALUES.join(", ")}.`
        );
    }
    return value;
}

function mapReportCardDecision(decision, promoted = false) {
    const value = String(decision || "PENDING").toUpperCase();
    if (value === "CONDITIONAL") return "PROMOTED_ON_PROBATION";
    if (value === "DEFERRED") return "PENDING";
    if (DECISION_VALUES.includes(value) && value !== "PENDING") return value;
    if (promoted) return "PROMOTED";
    return "PENDING";
}

function autoDecisionFromAverage(average, promotionPass, probationPass) {
    const score = Number(average);
    if (Number.isNaN(score)) return "PENDING";
    if (score >= promotionPass) return "PROMOTED";
    if (score >= probationPass) return "PROMOTED_ON_PROBATION";
    return "REPEAT";
}

class StudentPromotionService {
    async getConfigThresholds() {
        const [promotionRaw, probationRaw, passRaw] = await Promise.all([
            studentPromotionRepository.getConfigValue(
                "academic.promotion_pass_average"
            ),
            studentPromotionRepository.getConfigValue(
                "academic.probation_pass_average"
            ),
            studentPromotionRepository.getConfigValue("academic.pass_mark"),
        ]);

        const promotionPass = Number(promotionRaw ?? passRaw ?? 50);
        const probationPass = Number(probationRaw ?? 40);

        return {
            promotionPass: Number.isNaN(promotionPass) ? 50 : promotionPass,
            probationPass: Number.isNaN(probationPass) ? 40 : probationPass,
        };
    }

    async generateEnrollmentNumber() {
        const year = new Date().getFullYear();
        let counter = 1;
        const latest =
            await studentPromotionRepository.findLatestEnrollmentNumber(year);

        if (latest?.enrollmentNumber) {
            const parsed = parseInt(
                latest.enrollmentNumber.replace(/^ENR-\d+-/, ""),
                10
            );
            if (!Number.isNaN(parsed)) counter = parsed + 1;
        }

        while (true) {
            const enrollmentNumber = `ENR-${year}-${String(counter).padStart(6, "0")}`;
            const exists =
                await studentPromotionRepository.findEnrollmentByNumber(
                    enrollmentNumber
                );
            if (!exists) return enrollmentNumber;
            counter += 1;
        }
    }

    async resolveDestinationClass({
        decision,
        fromClass,
        toAcademicYearId,
        toClassId = null,
        classMappings = {},
    }) {
        if (EXIT_DECISIONS.has(decision)) {
            return { toClassId: null, toAcademicYearId: null };
        }

        if (!toAcademicYearId) {
            throw new BadRequestError(
                "Destination academic year is required for continuation decisions."
            );
        }

        let resolvedClassId =
            toClassId ||
            classMappings[String(fromClass.id)] ||
            classMappings[fromClass.id] ||
            null;

        if (!resolvedClassId && CONTINUATION_DECISIONS.has(decision)) {
            const matched =
                await studentPromotionRepository.findClassByCodeInYear(
                    fromClass.classCode,
                    toAcademicYearId
                );
            if (matched) resolvedClassId = matched.id;
        }

        if (!resolvedClassId) {
            return { toClassId: null, toAcademicYearId };
        }

        const toClass =
            await studentPromotionRepository.findSchoolClassById(
                resolvedClassId
            );
        if (!toClass) {
            throw new NotFoundError("Destination class not found.");
        }
        if (toClass.academicYearId !== Number(toAcademicYearId)) {
            throw new BadRequestError(
                "Destination class must belong to the destination academic year."
            );
        }

        return { toClassId: toClass.id, toAcademicYearId };
    }

    async getPromotions(query = {}) {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 20, 100);
        const search = query.search || query.keyword || "";

        return studentPromotionRepository.findPromotions({
            page,
            limit,
            search,
            fromAcademicYearId: Number(query.fromAcademicYearId || query.academicYearId) || null,
            toAcademicYearId: Number(query.toAcademicYearId) || null,
            termId: Number(query.termId) || null,
            fromClassId: Number(query.fromClassId || query.classId) || null,
            toClassId: Number(query.toClassId) || null,
            studentId: Number(query.studentId) || null,
            decision: query.decision
                ? String(query.decision).toUpperCase()
                : null,
            workflowStatus: query.workflowStatus
                ? String(query.workflowStatus).toUpperCase()
                : null,
            status: query.status || null,
            graduatesOnly: Boolean(parseBool(query.graduatesOnly)),
            sortBy: query.sortBy || "createdAt",
            sortOrder: query.sortOrder || "desc",
        });
    }

    async getArchivedPromotions(query = {}) {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 20, 100);
        return studentPromotionRepository.findPromotions({
            page,
            limit,
            search: query.search || query.keyword || "",
            fromAcademicYearId: Number(query.fromAcademicYearId || query.academicYearId) || null,
            termId: Number(query.termId) || null,
            fromClassId: Number(query.fromClassId || query.classId) || null,
            includeDeleted: true,
            sortBy: query.sortBy || "updatedAt",
            sortOrder: query.sortOrder || "desc",
        });
    }

    async getGraduates(query = {}) {
        return this.getPromotions({
            ...query,
            decision: "GRADUATED",
            graduatesOnly: true,
        });
    }

    async getStats(query = {}) {
        const scope = String(query.scope || "overview").toLowerCase();
        if (!SUMMARY_SCOPES.includes(scope)) {
            throw new BadRequestError(
                `Stats scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`
            );
        }
        return studentPromotionRepository.getStats({
            fromAcademicYearId: Number(query.fromAcademicYearId || query.academicYearId) || null,
            termId: Number(query.termId) || null,
            fromClassId: Number(query.fromClassId || query.classId) || null,
            scope,
        });
    }

    async getPromotionById(id) {
        const promotion =
            await studentPromotionRepository.findPromotionById(id);
        if (!promotion) {
            throw new NotFoundError("Student promotion not found.");
        }
        return promotion;
    }

    async getStudentHistory(studentId) {
        const student =
            await studentPromotionRepository.findStudentById(studentId);
        if (!student) {
            throw new NotFoundError("Student not found.");
        }
        return studentPromotionRepository.findStudentHistory(studentId);
    }

    /**
     * Generate DRAFT recommendations from published/locked report cards.
     * Supports single student or entire class (bulk).
     */
    async recommend(rawData = {}, user = null) {
        const academicYearId = Number(rawData.academicYearId);
        const termId = Number(rawData.termId) || null;
        const classId = Number(rawData.classId) || null;
        const studentId = Number(rawData.studentId) || null;
        const forceDecision = rawData.decision
            ? assertDecision(rawData.decision)
            : null;
        const regenerate = Boolean(rawData.regenerate);
        const classMappings = rawData.classMappings || {};

        if (!academicYearId) {
            throw new BadRequestError("Academic year is required.");
        }
        if (!classId && !studentId) {
            throw new BadRequestError(
                "Provide classId (bulk) and/or studentId to generate recommendations."
            );
        }

        const fromYear =
            await studentPromotionRepository.findAcademicYearById(
                academicYearId
            );
        if (!fromYear) {
            throw new NotFoundError("Academic year not found.");
        }

        let toAcademicYearId = Number(rawData.toAcademicYearId) || null;
        if (!toAcademicYearId) {
            const nextYear =
                await studentPromotionRepository.findNextAcademicYear(fromYear);
            toAcademicYearId = nextYear?.id || null;
        } else {
            const destYear =
                await studentPromotionRepository.findAcademicYearById(
                    toAcademicYearId
                );
            if (!destYear) {
                throw new NotFoundError("Destination academic year not found.");
            }
        }

        if (termId) {
            const term = await studentPromotionRepository.findTermById(termId);
            if (!term) throw new NotFoundError("Term not found.");
            if (term.academicYearId !== academicYearId) {
                throw new BadRequestError(
                    "Term does not belong to the selected academic year."
                );
            }
        }

        const reportCards =
            await studentPromotionRepository.findPublishedReportCards({
                academicYearId,
                termId,
                classId,
                studentId,
            });

        if (!reportCards.length) {
            throw new BusinessRuleError(
                "No published or locked report cards found for the selected scope. Publish report cards before recommending promotions."
            );
        }

        // Prefer latest term card per student when term not specified
        const byStudent = new Map();
        for (const card of reportCards) {
            const existing = byStudent.get(card.studentId);
            if (!existing || (card.termId || 0) >= (existing.termId || 0)) {
                byStudent.set(card.studentId, card);
            }
        }

        const thresholds = await this.getConfigThresholds();
        const created = [];
        const updated = [];
        const skipped = [];
        const errors = [];
        const now = new Date();
        const userId = user?.id || null;

        for (const card of byStudent.values()) {
            try {
                const existing =
                    await studentPromotionRepository.findByStudentAndYear(
                        card.studentId,
                        academicYearId,
                        { includeDeleted: true }
                    );

                const isActive =
                    existing &&
                    !existing.deletedAt &&
                    existing.status !== "ARCHIVED";

                if (isActive && existing.workflowStatus === "EXECUTED") {
                    skipped.push({
                        studentId: card.studentId,
                        reason: "Promotion already executed for this academic year.",
                    });
                    continue;
                }

                if (
                    isActive &&
                    !regenerate &&
                    existing.workflowStatus !== "CANCELLED"
                ) {
                    skipped.push({
                        studentId: card.studentId,
                        reason: "Recommendation already exists (pass regenerate=true).",
                    });
                    continue;
                }

                if (
                    isActive &&
                    regenerate &&
                    ["APPROVED", "EXECUTED"].includes(existing.workflowStatus) &&
                    !isAdmin(user)
                ) {
                    skipped.push({
                        studentId: card.studentId,
                        reason: "Only an Administrator can regenerate approved or executed promotions.",
                    });
                    continue;
                }

                let decision =
                    forceDecision && forceDecision !== "PENDING"
                        ? forceDecision
                        : mapReportCardDecision(
                              card.promotionDecision,
                              card.promoted
                          );

                if (decision === "PENDING") {
                    decision = autoDecisionFromAverage(
                        card.averageScore,
                        thresholds.promotionPass,
                        thresholds.probationPass
                    );
                }

                const fromClass =
                    card.schoolClass ||
                    (await studentPromotionRepository.findSchoolClassById(
                        card.classId
                    ));
                if (!fromClass) {
                    throw new NotFoundError("Source class not found.");
                }

                const destination = await this.resolveDestinationClass({
                    decision,
                    fromClass,
                    toAcademicYearId,
                    toClassId: Number(rawData.toClassId) || null,
                    classMappings,
                });

                const notes = [
                    `Recommended from report card #${card.id}`,
                    card.averageScore != null
                        ? `average ${card.averageScore}`
                        : null,
                    card.overallGrade ? `grade ${card.overallGrade}` : null,
                    `thresholds promote≥${thresholds.promotionPass} probation≥${thresholds.probationPass}`,
                ]
                    .filter(Boolean)
                    .join("; ");

                const payload = {
                    studentId: card.studentId,
                    fromClassId: card.classId,
                    toClassId: destination.toClassId,
                    fromAcademicYearId: academicYearId,
                    toAcademicYearId: destination.toAcademicYearId,
                    termId: card.termId,
                    reportCardId: card.id,
                    decision,
                    workflowStatus: "DRAFT",
                    averageScore: card.averageScore,
                    overallGrade: card.overallGrade || null,
                    classPosition: card.classPosition,
                    subjectCount: card.subjectCount,
                    passedCount: card.passedCount,
                    failedCount: card.failedCount,
                    recommendationNotes: notes,
                    recommendedAt: now,
                    recommendedById: userId,
                    approvedAt: null,
                    approvedById: null,
                    executedAt: null,
                    executedById: null,
                    promotionDate: null,
                    resultingEnrollmentId: null,
                    status: "ACTIVE",
                    deletedAt: null,
                    remarks: rawData.remarks || existing?.remarks || null,
                };

                if (existing) {
                    const updatedRow =
                        await studentPromotionRepository.updatePromotion(
                            existing.id,
                            payload
                        );
                    updated.push(updatedRow);
                } else {
                    const createdRow =
                        await studentPromotionRepository.createPromotion(
                            payload
                        );
                    created.push(createdRow);
                }
            } catch (error) {
                errors.push({
                    studentId: card.studentId,
                    reason: error.message || "Failed to recommend.",
                });
            }
        }

        return {
            created,
            updated,
            skipped,
            errors,
            summary: {
                created: created.length,
                updated: updated.length,
                skipped: skipped.length,
                errors: errors.length,
                totalCandidates: byStudent.size,
            },
        };
    }

    async updatePromotion(id, rawData = {}, user = null) {
        const promotion =
            await studentPromotionRepository.findPromotionById(id, {
                includeDeleted: true,
            });
        if (!promotion || promotion.deletedAt) {
            throw new NotFoundError("Student promotion not found.");
        }
        if (promotion.workflowStatus === "EXECUTED" && !isAdmin(user)) {
            throw new ForbiddenError(
                "Executed promotions can only be edited by an Administrator."
            );
        }
        if (promotion.workflowStatus === "CANCELLED") {
            throw new BusinessRuleError(
                "Cancelled promotions cannot be edited. Restore or regenerate instead."
            );
        }

        const data = {};

        if (rawData.decision !== undefined) {
            data.decision = assertDecision(rawData.decision);
            if (data.decision === "PENDING") {
                throw new BadRequestError(
                    "Set a concrete promotion decision before saving."
                );
            }
        }

        if (rawData.remarks !== undefined) {
            data.remarks =
                rawData.remarks === null || rawData.remarks === ""
                    ? null
                    : String(rawData.remarks).trim();
        }

        if (rawData.recommendationNotes !== undefined) {
            data.recommendationNotes =
                rawData.recommendationNotes === null ||
                rawData.recommendationNotes === ""
                    ? null
                    : String(rawData.recommendationNotes).trim();
        }

        if (rawData.toAcademicYearId !== undefined) {
            const yearId = Number(rawData.toAcademicYearId) || null;
            if (yearId) {
                const year =
                    await studentPromotionRepository.findAcademicYearById(
                        yearId
                    );
                if (!year) {
                    throw new NotFoundError("Destination academic year not found.");
                }
            }
            data.toAcademicYearId = yearId;
        }

        if (rawData.toClassId !== undefined) {
            const classId = Number(rawData.toClassId) || null;
            if (classId) {
                const schoolClass =
                    await studentPromotionRepository.findSchoolClassById(
                        classId
                    );
                if (!schoolClass) {
                    throw new NotFoundError("Destination class not found.");
                }
                const destYearId =
                    data.toAcademicYearId !== undefined
                        ? data.toAcademicYearId
                        : promotion.toAcademicYearId;
                if (destYearId && schoolClass.academicYearId !== destYearId) {
                    throw new BadRequestError(
                        "Destination class must belong to the destination academic year."
                    );
                }
            }
            data.toClassId = classId;
        }

        if (rawData.promotionDate !== undefined) {
            data.promotionDate = rawData.promotionDate
                ? toDate(rawData.promotionDate)
                : null;
        }

        // Enforce exit vs continuation consistency after merges
        const nextDecision = data.decision || promotion.decision;
        if (EXIT_DECISIONS.has(nextDecision)) {
            data.toClassId = null;
            data.toAcademicYearId = null;
        }

        return studentPromotionRepository.updatePromotion(id, data);
    }

    async approve(rawData = {}, user = null) {
        if (!APPROVE_ROLES.has(roleName(user))) {
            throw new ForbiddenError(
                "Only Administrator, Headmaster, or Registrar can approve promotions."
            );
        }

        const ids = Array.isArray(rawData.ids)
            ? rawData.ids.map(Number).filter(Boolean)
            : rawData.id
              ? [Number(rawData.id)]
              : [];

        if (!ids.length) {
            throw new BadRequestError("Provide id or ids to approve.");
        }

        const rows =
            await studentPromotionRepository.findPromotionsByIds(ids);
        const now = new Date();
        const approved = [];
        const skipped = [];

        for (const row of rows) {
            if (row.workflowStatus === "EXECUTED") {
                skipped.push({
                    id: row.id,
                    reason: "Already executed.",
                });
                continue;
            }
            if (row.workflowStatus === "CANCELLED") {
                skipped.push({
                    id: row.id,
                    reason: "Cancelled promotions cannot be approved.",
                });
                continue;
            }
            if (!EXECUTABLE_DECISIONS.has(row.decision)) {
                skipped.push({
                    id: row.id,
                    reason: "Set a concrete decision before approving.",
                });
                continue;
            }
            if (
                CONTINUATION_DECISIONS.has(row.decision) &&
                (!row.toClassId || !row.toAcademicYearId)
            ) {
                skipped.push({
                    id: row.id,
                    reason: "Destination class and academic year are required before approval.",
                });
                continue;
            }

            const updated = await studentPromotionRepository.updatePromotion(
                row.id,
                {
                    workflowStatus: "APPROVED",
                    approvedAt: now,
                    approvedById: user?.id || null,
                }
            );
            approved.push(updated);
        }

        const missing = ids.filter(
            (id) => !rows.some((row) => row.id === id)
        );
        for (const id of missing) {
            skipped.push({ id, reason: "Promotion not found." });
        }

        return {
            approved,
            skipped,
            summary: {
                approved: approved.length,
                skipped: skipped.length,
            },
        };
    }

    async unapprove(rawData = {}, user = null) {
        if (!isAdmin(user)) {
            throw new ForbiddenError(
                "Only an Administrator can reverse approval."
            );
        }

        const ids = Array.isArray(rawData.ids)
            ? rawData.ids.map(Number).filter(Boolean)
            : rawData.id
              ? [Number(rawData.id)]
              : [];

        if (!ids.length) {
            throw new BadRequestError("Provide id or ids to unapprove.");
        }

        const rows =
            await studentPromotionRepository.findPromotionsByIds(ids);
        const reverted = [];
        const skipped = [];

        for (const row of rows) {
            if (row.workflowStatus !== "APPROVED") {
                skipped.push({
                    id: row.id,
                    reason: "Only approved promotions can be unapproved.",
                });
                continue;
            }
            const updated = await studentPromotionRepository.updatePromotion(
                row.id,
                {
                    workflowStatus: "DRAFT",
                    approvedAt: null,
                    approvedById: null,
                }
            );
            reverted.push(updated);
        }

        return {
            reverted,
            skipped,
            summary: {
                reverted: reverted.length,
                skipped: skipped.length,
            },
        };
    }

    async execute(rawData = {}, user = null) {
        if (!EXECUTE_ROLES.has(roleName(user))) {
            throw new ForbiddenError(
                "Only Administrator, Headmaster, or Registrar can execute promotions."
            );
        }

        const ids = Array.isArray(rawData.ids)
            ? rawData.ids.map(Number).filter(Boolean)
            : rawData.id
              ? [Number(rawData.id)]
              : [];

        if (!ids.length) {
            throw new BadRequestError("Provide id or ids to execute.");
        }

        const rows =
            await studentPromotionRepository.findPromotionsByIds(ids);
        const executed = [];
        const skipped = [];
        const errors = [];
        const now = new Date();
        const promotionDate = rawData.promotionDate
            ? toDate(rawData.promotionDate)
            : now;

        for (const row of rows) {
            try {
                if (row.workflowStatus === "EXECUTED") {
                    skipped.push({
                        id: row.id,
                        reason: "Already executed.",
                    });
                    continue;
                }
                if (row.workflowStatus !== "APPROVED") {
                    skipped.push({
                        id: row.id,
                        reason: "Approve the promotion before executing.",
                    });
                    continue;
                }
                if (!EXECUTABLE_DECISIONS.has(row.decision)) {
                    skipped.push({
                        id: row.id,
                        reason: "Invalid decision for execution.",
                    });
                    continue;
                }

                let enrollmentData = null;
                let studentUpdate = null;

                if (CONTINUATION_DECISIONS.has(row.decision)) {
                    if (!row.toClassId || !row.toAcademicYearId) {
                        throw new BusinessRuleError(
                            "Destination class and academic year are required."
                        );
                    }

                    const toClass =
                        await studentPromotionRepository.findSchoolClassById(
                            row.toClassId
                        );
                    if (!toClass) {
                        throw new NotFoundError("Destination class not found.");
                    }

                    const existingEnrollment =
                        await studentPromotionRepository.findEnrollmentByStudentAndYear(
                            row.studentId,
                            row.toAcademicYearId
                        );

                    if (
                        existingEnrollment &&
                        !existingEnrollment.deletedAt &&
                        existingEnrollment.status !== "ARCHIVED"
                    ) {
                        throw new ConflictError(
                            "Student already has an enrollment for the destination academic year."
                        );
                    }

                    if (
                        existingEnrollment &&
                        (existingEnrollment.deletedAt ||
                            existingEnrollment.status === "ARCHIVED")
                    ) {
                        throw new ConflictError(
                            "An archived enrollment exists for the destination year. Restore it instead of promoting."
                        );
                    }

                    const enrolled =
                        await studentPromotionRepository.countActiveEnrollmentsInClass(
                            row.toClassId
                        );
                    if (enrolled >= toClass.capacity) {
                        throw new ConflictError(
                            `Destination class capacity of ${toClass.capacity} has been reached.`
                        );
                    }

                    const enrollmentNumber =
                        await this.generateEnrollmentNumber();
                    enrollmentData = {
                        enrollmentNumber,
                        studentId: row.studentId,
                        schoolClassId: row.toClassId,
                        academicYearId: row.toAcademicYearId,
                        enrollmentDate: promotionDate,
                        status: "ACTIVE",
                        remarks: `Created by ${row.decision} promotion #${row.id}`,
                    };

                    studentUpdate = {
                        id: row.studentId,
                        data: {
                            classId: row.toClassId,
                            status: "ACTIVE",
                        },
                    };
                } else if (EXIT_DECISIONS.has(row.decision)) {
                    studentUpdate = {
                        id: row.studentId,
                        data: {
                            status: "INACTIVE",
                        },
                    };
                }

                const result =
                    await studentPromotionRepository.executePromotionTransaction(
                        {
                            promotionId: row.id,
                            enrollmentData,
                            studentUpdate,
                            promotionUpdate: {
                                workflowStatus: "EXECUTED",
                                executedAt: now,
                                executedById: user?.id || null,
                                promotionDate,
                                remarks:
                                    rawData.remarks !== undefined
                                        ? rawData.remarks
                                        : row.remarks,
                            },
                        }
                    );

                executed.push(result.promotion);
            } catch (error) {
                errors.push({
                    id: row.id,
                    reason: error.message || "Failed to execute promotion.",
                });
            }
        }

        const missing = ids.filter(
            (id) => !rows.some((row) => row.id === id)
        );
        for (const id of missing) {
            skipped.push({ id, reason: "Promotion not found." });
        }

        return {
            executed,
            skipped,
            errors,
            summary: {
                executed: executed.length,
                skipped: skipped.length,
                errors: errors.length,
            },
        };
    }

    async cancel(rawData = {}, user = null) {
        const ids = Array.isArray(rawData.ids)
            ? rawData.ids.map(Number).filter(Boolean)
            : rawData.id
              ? [Number(rawData.id)]
              : [];

        if (!ids.length) {
            throw new BadRequestError("Provide id or ids to cancel.");
        }

        const rows =
            await studentPromotionRepository.findPromotionsByIds(ids);
        const cancelled = [];
        const skipped = [];

        for (const row of rows) {
            if (row.workflowStatus === "EXECUTED") {
                skipped.push({
                    id: row.id,
                    reason: "Executed promotions cannot be cancelled.",
                });
                continue;
            }
            if (row.workflowStatus === "CANCELLED") {
                skipped.push({ id: row.id, reason: "Already cancelled." });
                continue;
            }
            if (
                row.workflowStatus === "APPROVED" &&
                !APPROVE_ROLES.has(roleName(user))
            ) {
                skipped.push({
                    id: row.id,
                    reason: "Insufficient role to cancel an approved promotion.",
                });
                continue;
            }

            const updated = await studentPromotionRepository.updatePromotion(
                row.id,
                {
                    workflowStatus: "CANCELLED",
                    approvedAt: null,
                    approvedById: null,
                }
            );
            cancelled.push(updated);
        }

        return {
            cancelled,
            skipped,
            summary: {
                cancelled: cancelled.length,
                skipped: skipped.length,
            },
        };
    }

    async archivePromotion(id, user = null) {
        const promotion =
            await studentPromotionRepository.findPromotionById(id);
        if (!promotion) {
            throw new NotFoundError("Student promotion not found.");
        }
        if (promotion.workflowStatus === "EXECUTED" && !isAdmin(user)) {
            throw new ForbiddenError(
                "Executed promotions can only be archived by an Administrator."
            );
        }
        return studentPromotionRepository.softDeletePromotion(id);
    }

    async restorePromotion(id) {
        const promotion =
            await studentPromotionRepository.findPromotionById(id, {
                includeDeleted: true,
            });
        if (!promotion) {
            throw new NotFoundError("Student promotion not found.");
        }
        if (!promotion.deletedAt && promotion.status !== "ARCHIVED") {
            throw new BusinessRuleError("Promotion is not archived.");
        }

        const duplicate =
            await studentPromotionRepository.findByStudentAndYear(
                promotion.studentId,
                promotion.fromAcademicYearId
            );
        if (duplicate && duplicate.id !== promotion.id) {
            throw new ConflictError(
                "An active promotion already exists for this student and academic year."
            );
        }

        return studentPromotionRepository.restorePromotion(id);
    }
}

module.exports = new StudentPromotionService();
