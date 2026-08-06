const resultRepository = require("../repositories/result.repository");
const {
    BadRequestError,
    NotFoundError,
    ConflictError,
    BusinessRuleError,
    ForbiddenError,
} = require("../errors");

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const SUMMARY_SCOPES = ["overview", "class", "subject", "student", "grade"];
const WORKFLOW_VALUES = ["DRAFT", "GENERATED", "VERIFIED", "PUBLISHED", "LOCKED"];
const ID_FIELDS = new Set([
    "academicYearId",
    "termId",
    "classId",
    "subjectId",
    "studentId",
    "examinationId",
    "gradeId",
]);

const DEFAULT_CA_WEIGHT = 40;
const DEFAULT_EXAM_WEIGHT = 60;
const DEFAULT_PASS_MARK = 50;

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

function sanitize(data = {}) {
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
        "status",
        "isPassed",
    ]) {
        if (data[field] === undefined) continue;
        if (ID_FIELDS.has(field)) {
            if (data[field] !== "" && data[field] !== null) {
                payload[field] = parseInt(data[field], 10);
            }
        } else if (
            ["caScore", "examScore", "caWeight", "examWeight", "finalScore"].includes(field)
        ) {
            payload[field] =
                data[field] === null || data[field] === "" ? null : Number(data[field]);
        } else if (field === "status") {
            payload[field] = String(data[field]).trim().toUpperCase();
        } else if (field === "isPassed") {
            payload[field] = Boolean(data[field]);
        } else if (field === "remarks") {
            payload[field] = data[field] === null ? null : String(data[field]).trim() || null;
        } else {
            payload[field] = data[field];
        }
    }
    return payload;
}

function validateStatus(value) {
    if (value && !STATUS_VALUES.includes(value)) {
        throw new BadRequestError("Status must be ACTIVE or INACTIVE.");
    }
}

function validateWorkflow(value) {
    if (value && !WORKFLOW_VALUES.includes(value)) {
        throw new BadRequestError(
            `Workflow status must be one of: ${WORKFLOW_VALUES.join(", ")}.`
        );
    }
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

function studentDisplayName(student = {}) {
    return [student.firstName, student.otherName, student.lastName].filter(Boolean).join(" ");
}

function scoreInRange(value, label) {
    if (value == null || Number.isNaN(Number(value))) {
        throw new BadRequestError(`${label} must be a valid number.`);
    }
    const score = Number(value);
    if (score < 0 || score > 100) {
        throw new BadRequestError(`${label} must be between 0 and 100.`);
    }
    return round2(score);
}

function computeRanks(items, scoreKey = "finalScore") {
    const sorted = [...items].sort(
        (a, b) => Number(b[scoreKey] || 0) - Number(a[scoreKey] || 0)
    );
    let lastScore = null;
    let lastRank = 0;
    const ranks = new Map();
    sorted.forEach((item, index) => {
        const score = Number(item[scoreKey] || 0);
        const rank = lastScore !== null && score === lastScore ? lastRank : index + 1;
        ranks.set(item.id ?? item.studentId, rank);
        lastScore = score;
        lastRank = rank;
    });
    return ranks;
}

class ResultService {
    async getWeightConfig() {
        const [caSetting, examSetting, passSetting] = await Promise.all([
            resultRepository.getSettingValue("academic.ca_weight"),
            resultRepository.getSettingValue("academic.exam_weight"),
            resultRepository.getSettingValue("academic.pass_mark"),
        ]);

        let caWeight = caSetting ? Number(caSetting.settingValue) : DEFAULT_CA_WEIGHT;
        let examWeight = examSetting ? Number(examSetting.settingValue) : DEFAULT_EXAM_WEIGHT;
        let passMark = passSetting ? Number(passSetting.settingValue) : DEFAULT_PASS_MARK;

        if (Number.isNaN(caWeight) || caWeight < 0 || caWeight > 100) caWeight = DEFAULT_CA_WEIGHT;
        if (Number.isNaN(examWeight) || examWeight < 0 || examWeight > 100) {
            examWeight = DEFAULT_EXAM_WEIGHT;
        }
        if (Number.isNaN(passMark) || passMark < 0 || passMark > 100) {
            passMark = DEFAULT_PASS_MARK;
        }

        const total = round2(caWeight + examWeight);
        if (total !== 100) {
            // Keep ratios but normalize to 100 so generation remains stable.
            if (total <= 0) {
                caWeight = DEFAULT_CA_WEIGHT;
                examWeight = DEFAULT_EXAM_WEIGHT;
            } else {
                caWeight = round2((caWeight / total) * 100);
                examWeight = round2(100 - caWeight);
            }
        }

        return { caWeight, examWeight, passMark };
    }

    async resolveGrade(finalScore, grades) {
        const score = Number(finalScore);
        const match = grades.find(
            (grade) =>
                score >= Number(grade.minimumScore) && score <= Number(grade.maximumScore)
        );
        if (match) return match;
        // Fallback to lowest band when score falls through gaps.
        return grades[grades.length - 1] || null;
    }

    aggregateCaPercentage(assessments, studentId) {
        const percentages = [];
        for (const assessment of assessments) {
            const maxMarks = Number(assessment.maxMarks);
            if (!maxMarks) continue;
            const score = (assessment.scores || []).find(
                (entry) => entry.studentId === studentId
            );
            if (!score) continue;
            percentages.push((Number(score.marks) / maxMarks) * 100);
        }
        if (!percentages.length) return null;
        return round2(
            percentages.reduce((sum, value) => sum + value, 0) / percentages.length
        );
    }

    examPercentage(examination, studentId) {
        const maxMarks = Number(examination.maxMarks);
        if (!maxMarks) return null;
        const score = (examination.scores || []).find(
            (entry) => entry.studentId === studentId
        );
        if (!score) return null;
        return round2((Number(score.marks) / maxMarks) * 100);
    }

    composeFinal({ caScore, examScore, caWeight, examWeight }) {
        return round2((caScore * caWeight) / 100 + (examScore * examWeight) / 100);
    }

    /**
     * Pass/fail uses System Settings pass mark as the primary rule.
     * When a grade band is resolved, its isPass flag must also agree (schools
     * can tune bands without code changes).
     */
    resolvePassStatus(finalScore, grade, passMark) {
        const aboveMark = Number(finalScore) >= Number(passMark);
        if (grade && typeof grade.isPass === "boolean") {
            return aboveMark && Boolean(grade.isPass);
        }
        return aboveMark;
    }

    /**
     * Resolve CA/Exam weights from settings with optional per-request overrides.
     */
    async resolveWeights(overrides = {}) {
        const defaults = await this.getWeightConfig();
        let caWeight =
            overrides.caWeight != null
                ? scoreInRange(overrides.caWeight, "CA weight")
                : defaults.caWeight;
        let examWeight =
            overrides.examWeight != null
                ? scoreInRange(overrides.examWeight, "Exam weight")
                : defaults.examWeight;

        const total = round2(caWeight + examWeight);
        if (total !== 100) {
            throw new BadRequestError("CA weight and exam weight must add up to 100.");
        }

        return {
            caWeight,
            examWeight,
            passMark: defaults.passMark,
        };
    }

    assertEditable(result, user) {
        if (
            (result.isLocked || result.workflowStatus === "LOCKED") &&
            !isAdmin(user)
        ) {
            throw new ForbiddenError(
                "This result is locked and can only be modified by an administrator."
            );
        }
    }

    assertNotReleased(result, user, action = "modify") {
        if (
            (result.isPublished ||
                result.isLocked ||
                ["PUBLISHED", "LOCKED"].includes(result.workflowStatus)) &&
            !isAdmin(user)
        ) {
            throw new ForbiddenError(
                `Published or locked results can only be ${action} by an administrator.`
            );
        }
    }

    async assertScopeEntities(data) {
        const [academicYear, term, schoolClass, subject] = await Promise.all([
            resultRepository.findAcademicYearById(data.academicYearId),
            resultRepository.findTermById(data.termId),
            resultRepository.findSchoolClassById(data.classId),
            resultRepository.findSubjectById(data.subjectId),
        ]);

        if (!academicYear) throw new NotFoundError("Academic year not found.");
        if (!term) throw new NotFoundError("Term not found.");
        if (term.academicYearId !== data.academicYearId) {
            throw new BadRequestError("Term does not belong to the selected academic year.");
        }
        if (!schoolClass) throw new NotFoundError("School class not found.");
        if (schoolClass.academicYearId !== data.academicYearId) {
            throw new BadRequestError("Class does not belong to the selected academic year.");
        }
        if (!subject) throw new NotFoundError("Subject not found.");

        const classSubject = await resultRepository.findActiveClassSubject({
            schoolClassId: data.classId,
            subjectId: data.subjectId,
            academicYearId: data.academicYearId,
            termId: data.termId,
        });
        if (!classSubject) {
            throw new BusinessRuleError(
                "Subject is not allocated to this class for the selected academic year and term."
            );
        }

        return { academicYear, term, schoolClass, subject };
    }

    async getResults(query = {}) {
        const status = query.status ? String(query.status).trim().toUpperCase() : null;
        if (status) validateStatus(status);

        return resultRepository.findResults({
            page: Math.max(1, parseInt(query.page, 10) || 1),
            limit: Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20)),
            search: (query.search || query.keyword || "").trim(),
            academicYearId: Number(query.academicYearId) || null,
            termId: Number(query.termId) || null,
            classId: Number(query.classId) || null,
            subjectId: Number(query.subjectId) || null,
            studentId: Number(query.studentId) || null,
            examinationId: Number(query.examinationId) || null,
            gradeId: Number(query.gradeId) || null,
            status,
            workflowStatus: (() => {
                const value = query.workflowStatus
                    ? String(query.workflowStatus).trim().toUpperCase()
                    : null;
                if (value) validateWorkflow(value);
                return value;
            })(),
            isPassed: parseBool(query.isPassed),
            isVerified: parseBool(query.isVerified),
            isPublished: parseBool(query.isPublished),
            isLocked: parseBool(query.isLocked),
            sortBy: (query.sortBy || "finalScore").trim(),
            sortOrder: (query.sortOrder || "desc").trim().toLowerCase(),
        });
    }

    async getArchivedResults(query = {}) {
        return resultRepository.findResults({
            page: Math.max(1, parseInt(query.page, 10) || 1),
            limit: Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20)),
            search: (query.search || query.keyword || "").trim(),
            onlyDeleted: true,
            sortBy: "updatedAt",
            sortOrder: "desc",
        });
    }

    async getResultById(id) {
        const result = await resultRepository.findResultById(id);
        if (!result) throw new NotFoundError("Result not found.");
        return result;
    }

    async getStats(query = {}) {
        const scope = String(query.scope || "overview").trim().toLowerCase();
        if (!SUMMARY_SCOPES.includes(scope)) {
            throw new BadRequestError(
                `Scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`
            );
        }
        return resultRepository.getStats({
            academicYearId: Number(query.academicYearId) || null,
            termId: Number(query.termId) || null,
            classId: Number(query.classId) || null,
            subjectId: Number(query.subjectId) || null,
            studentId: Number(query.studentId) || null,
            scope,
        });
    }

    async getWeightings() {
        const config = await this.getWeightConfig();
        await resultRepository.ensureDefaultGradeScale();
        const grades = await resultRepository.findActiveGrades();
        return { ...config, grades };
    }

    async recalculatePositionsForClass({ academicYearId, termId, classId, subjectId = null }) {
        const classResults = await resultRepository.findResultsForClassTerm({
            academicYearId,
            termId,
            classId,
        });
        if (!classResults.length) return { updated: 0 };

        const subjectGroups = new Map();
        for (const row of classResults) {
            if (!subjectGroups.has(row.subjectId)) subjectGroups.set(row.subjectId, []);
            subjectGroups.get(row.subjectId).push(row);
        }

        const updates = [];
        for (const [sid, rows] of subjectGroups.entries()) {
            if (subjectId && sid !== subjectId) continue;
            const average =
                rows.length > 0
                    ? round1(
                          rows.reduce((sum, row) => sum + Number(row.finalScore || 0), 0) /
                              rows.length
                      )
                    : 0;
            const ranks = computeRanks(rows, "finalScore");
            for (const row of rows) {
                updates.push({
                    id: row.id,
                    subjectPosition: ranks.get(row.id),
                    subjectAverage: average,
                });
            }
        }

        const byStudent = new Map();
        for (const row of classResults) {
            if (!byStudent.has(row.studentId)) byStudent.set(row.studentId, []);
            byStudent.get(row.studentId).push(Number(row.finalScore || 0));
        }

        const studentAverages = Array.from(byStudent.entries()).map(
            ([studentId, scores]) => ({
                studentId,
                finalScore:
                    scores.length > 0
                        ? scores.reduce((sum, value) => sum + value, 0) / scores.length
                        : 0,
            })
        );
        const classRanks = computeRanks(studentAverages, "finalScore");
        const classAverage =
            studentAverages.length > 0
                ? round1(
                      studentAverages.reduce((sum, row) => sum + row.finalScore, 0) /
                          studentAverages.length
                  )
                : 0;

        for (const row of classResults) {
            const existing = updates.find((item) => item.id === row.id);
            const payload = existing || { id: row.id };
            payload.classPosition = classRanks.get(row.studentId);
            payload.classAverage = classAverage;
            if (!existing) updates.push(payload);
        }

        await resultRepository.updatePositions(updates);
        return { updated: updates.length, classAverage };
    }

    async generateResults(rawData = {}, user = null) {
        const data = sanitize(rawData);
        for (const [field, label] of [
            ["academicYearId", "Academic year"],
            ["termId", "Term"],
            ["classId", "Class"],
            ["subjectId", "Subject"],
        ]) {
            if (!data[field]) throw new BadRequestError(`${label} is required.`);
        }

        const regenerate = Boolean(rawData.regenerate);
        const asDraft = Boolean(rawData.asDraft);
        const initialWorkflow = asDraft ? "DRAFT" : "GENERATED";
        await this.assertScopeEntities(data);

        const examination = await resultRepository.findLockedExaminationForScope({
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId,
            subjectId: data.subjectId,
            examinationId: data.examinationId || null,
        });

        if (!examination) {
            throw new BusinessRuleError(
                "A locked (verified) examination is required before results can be generated for this class and subject."
            );
        }
        if (!examination.isLocked) {
            throw new BusinessRuleError(
                "Results can only be generated from locked/verified examinations."
            );
        }
        if (
            examination.academicYearId !== data.academicYearId ||
            examination.termId !== data.termId ||
            examination.classId !== data.classId ||
            examination.subjectId !== data.subjectId
        ) {
            throw new BadRequestError(
                "Selected examination does not match the generation scope."
            );
        }

        const assessments = await resultRepository.findAssessmentsForScope({
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId,
            subjectId: data.subjectId,
        });
        if (!assessments.length) {
            throw new BusinessRuleError(
                "At least one continuous assessment must exist for this class, subject, and term before generating results."
            );
        }

        const enrollments = await resultRepository.findEnrolledStudents({
            academicYearId: data.academicYearId,
            schoolClassId: data.classId,
            termId: data.termId,
        });
        if (!enrollments.length) {
            throw new BusinessRuleError(
                "No enrolled students found for this class and term."
            );
        }

        const existing = await resultRepository.findExistingForScope({
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId,
            subjectId: data.subjectId,
        });

        if (existing.length && !regenerate) {
            throw new ConflictError(
                "Results already exist for this class, subject, and term. Set regenerate=true to rebuild unlocked results."
            );
        }

        const lockedOrPublished = existing.filter(
            (row) =>
                row.isLocked ||
                row.isPublished ||
                ["PUBLISHED", "LOCKED"].includes(row.workflowStatus)
        );
        if (lockedOrPublished.length && regenerate && !isAdmin(user)) {
            throw new ForbiddenError(
                "Published or locked results can only be regenerated by an administrator."
            );
        }

        await resultRepository.ensureDefaultGradeScale();
        const grades = await resultRepository.findActiveGrades();
        if (!grades.length) {
            throw new BusinessRuleError(
                "No active grade bands are configured. Configure grades or grade scales first."
            );
        }

        const weights = await this.resolveWeights({
            caWeight: data.caWeight,
            examWeight: data.examWeight,
        });
        const existingByStudent = new Map(existing.map((row) => [row.studentId, row]));

        const created = [];
        const skipped = [];

        for (const enrollment of enrollments) {
            const studentId = enrollment.studentId;
            const prior = existingByStudent.get(studentId);
            if (
                prior &&
                (prior.isLocked ||
                    prior.isPublished ||
                    ["PUBLISHED", "LOCKED"].includes(prior.workflowStatus)) &&
                !isAdmin(user)
            ) {
                skipped.push({
                    studentId,
                    reason: "Result is published or locked.",
                });
                continue;
            }

            const caScore = this.aggregateCaPercentage(assessments, studentId);
            const examScore = this.examPercentage(examination, studentId);

            if (caScore == null) {
                skipped.push({
                    studentId,
                    reason: "No continuous assessment scores recorded.",
                });
                continue;
            }
            if (examScore == null) {
                skipped.push({
                    studentId,
                    reason: "No examination score recorded.",
                });
                continue;
            }

            const finalScore = this.composeFinal({
                caScore,
                examScore,
                caWeight: weights.caWeight,
                examWeight: weights.examWeight,
            });
            const grade = await this.resolveGrade(finalScore, grades);
            const isPassed = this.resolvePassStatus(
                finalScore,
                grade,
                weights.passMark
            );

            const payload = {
                academicYearId: data.academicYearId,
                termId: data.termId,
                classId: data.classId,
                subjectId: data.subjectId,
                studentId,
                examinationId: examination.id,
                caScore,
                examScore,
                caWeight: weights.caWeight,
                examWeight: weights.examWeight,
                finalScore,
                gradeId: grade?.id || null,
                remarks: grade?.remarks || null,
                isPassed,
                ...flagsFromWorkflow(initialWorkflow),
                status: "ACTIVE",
            };

            const saved = await resultRepository.upsertResult(payload);
            created.push(saved);
        }

        if (!created.length) {
            throw new BusinessRuleError(
                "No results were generated. Ensure enrolled students have both CA and examination scores."
            );
        }

        await this.recalculatePositionsForClass({
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId,
            subjectId: data.subjectId,
        });

        const refreshed = await resultRepository.findResults({
            page: 1,
            limit: Math.max(created.length, 20),
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId,
            subjectId: data.subjectId,
            sortBy: "subjectPosition",
            sortOrder: "asc",
        });

        return {
            examination: {
                id: examination.id,
                name: examination.name,
                examinationType: examination.examinationType,
                isLocked: examination.isLocked,
            },
            weights,
            generated: refreshed.data.length,
            skipped,
            results: refreshed.data,
        };
    }

    async createResult(rawData, user = null) {
        const data = sanitize(rawData);
        for (const [field, label] of [
            ["academicYearId", "Academic year"],
            ["termId", "Term"],
            ["classId", "Class"],
            ["subjectId", "Subject"],
            ["studentId", "Student"],
            ["examinationId", "Examination"],
        ]) {
            if (!data[field]) throw new BadRequestError(`${label} is required.`);
        }
        validateStatus(data.status);

        await this.assertScopeEntities(data);

        const [student, examination, enrollments] = await Promise.all([
            resultRepository.findStudentById(data.studentId),
            resultRepository.findExaminationById(data.examinationId),
            resultRepository.findEnrolledStudents({
                academicYearId: data.academicYearId,
                schoolClassId: data.classId,
                termId: data.termId,
            }),
        ]);

        if (!student) throw new NotFoundError("Student not found.");
        if (!examination) throw new NotFoundError("Examination not found.");
        if (!examination.isLocked) {
            throw new BusinessRuleError(
                "Results can only be created from locked/verified examinations."
            );
        }
        if (
            examination.academicYearId !== data.academicYearId ||
            examination.termId !== data.termId ||
            examination.classId !== data.classId ||
            examination.subjectId !== data.subjectId
        ) {
            throw new BadRequestError("Examination does not match the result scope.");
        }
        if (!enrollments.some((row) => row.studentId === data.studentId)) {
            throw new BusinessRuleError(
                "Only enrolled students can receive results for this class and term."
            );
        }

        const duplicate = await resultRepository.findDuplicate(data);
        if (duplicate) {
            throw new ConflictError(
                "A result already exists for this student in the selected class, subject, and term."
            );
        }

        const weights = await this.getWeightConfig();
        const caWeight = data.caWeight != null ? scoreInRange(data.caWeight, "CA weight") : weights.caWeight;
        const examWeight =
            data.examWeight != null
                ? scoreInRange(data.examWeight, "Exam weight")
                : weights.examWeight;
        if (round2(caWeight + examWeight) !== 100) {
            throw new BadRequestError("CA weight and exam weight must add up to 100.");
        }

        let caScore = data.caScore;
        let examScore = data.examScore;
        if (caScore == null || examScore == null) {
            const assessments = await resultRepository.findAssessmentsForScope({
                academicYearId: data.academicYearId,
                termId: data.termId,
                classId: data.classId,
                subjectId: data.subjectId,
            });
            if (caScore == null) caScore = this.aggregateCaPercentage(assessments, data.studentId);
            if (examScore == null) examScore = this.examPercentage(examination, data.studentId);
        }
        if (caScore == null || examScore == null) {
            throw new BusinessRuleError(
                "CA score and examination score are required (or must exist on source records)."
            );
        }
        caScore = scoreInRange(caScore, "CA score");
        examScore = scoreInRange(examScore, "Exam score");

        const finalScore =
            data.finalScore != null
                ? scoreInRange(data.finalScore, "Final score")
                : this.composeFinal({ caScore, examScore, caWeight, examWeight });

        await resultRepository.ensureDefaultGradeScale();
        const grades = await resultRepository.findActiveGrades();
        const grade = await this.resolveGrade(finalScore, grades);
        const resolvedGrade =
            data.gradeId != null
                ? grades.find((item) => item.id === data.gradeId) || grade
                : grade;

        const created = await resultRepository.createResult({
            ...data,
            caScore,
            examScore,
            caWeight,
            examWeight,
            finalScore,
            gradeId: data.gradeId || resolvedGrade?.id || null,
            remarks: data.remarks || resolvedGrade?.remarks || null,
            isPassed:
                data.isPassed != null
                    ? Boolean(data.isPassed)
                    : this.resolvePassStatus(finalScore, resolvedGrade, weights.passMark),
            ...flagsFromWorkflow("GENERATED"),
            status: data.status || "ACTIVE",
        });

        await this.recalculatePositionsForClass({
            academicYearId: data.academicYearId,
            termId: data.termId,
            classId: data.classId,
        });

        return this.getResultById(created.id);
    }

    async updateResult(id, rawData, user = null) {
        const existing = await this.getResultById(id);
        this.assertEditable(existing, user);
        this.assertNotReleased(existing, user, "updated");

        const data = sanitize(rawData);
        const next = {
            academicYearId: data.academicYearId ?? existing.academicYearId,
            termId: data.termId ?? existing.termId,
            classId: data.classId ?? existing.classId,
            subjectId: data.subjectId ?? existing.subjectId,
            studentId: data.studentId ?? existing.studentId,
            examinationId: data.examinationId ?? existing.examinationId,
            caScore: data.caScore ?? existing.caScore,
            examScore: data.examScore ?? existing.examScore,
            caWeight: data.caWeight ?? existing.caWeight,
            examWeight: data.examWeight ?? existing.examWeight,
            remarks: data.remarks !== undefined ? data.remarks : existing.remarks,
            status: data.status ?? existing.status,
        };

        validateStatus(next.status);
        await this.assertScopeEntities(next);

        const weights = await this.getWeightConfig();
        next.caScore = scoreInRange(next.caScore, "CA score");
        next.examScore = scoreInRange(next.examScore, "Exam score");
        next.caWeight = scoreInRange(next.caWeight, "CA weight");
        next.examWeight = scoreInRange(next.examWeight, "Exam weight");
        if (round2(next.caWeight + next.examWeight) !== 100) {
            throw new BadRequestError("CA weight and exam weight must add up to 100.");
        }

        next.finalScore =
            data.finalScore != null
                ? scoreInRange(data.finalScore, "Final score")
                : this.composeFinal(next);

        await resultRepository.ensureDefaultGradeScale();
        const grades = await resultRepository.findActiveGrades();
        const grade = await this.resolveGrade(next.finalScore, grades);
        next.gradeId = data.gradeId !== undefined ? data.gradeId : grade?.id || null;
        const resolvedGrade =
            next.gradeId != null
                ? grades.find((item) => item.id === next.gradeId) || grade
                : grade;
        if (data.remarks === undefined) {
            next.remarks = resolvedGrade?.remarks || existing.remarks;
        }
        next.isPassed =
            data.isPassed != null
                ? Boolean(data.isPassed)
                : this.resolvePassStatus(next.finalScore, resolvedGrade, weights.passMark);

        const duplicate = await resultRepository.findDuplicate({
            ...next,
            excludeId: id,
        });
        if (duplicate) {
            throw new ConflictError(
                "A result already exists for this student in the selected class, subject, and term."
            );
        }

        await resultRepository.updateResult(id, next);
        await this.recalculatePositionsForClass({
            academicYearId: next.academicYearId,
            termId: next.termId,
            classId: next.classId,
        });
        return this.getResultById(id);
    }

    async archiveResult(id, user = null) {
        const result = await this.getResultById(id);
        this.assertEditable(result, user);
        this.assertNotReleased(result, user, "archived");
        return resultRepository.softDeleteResult(id);
    }

    async restoreResult(id, user = null) {
        const result = await resultRepository.findResultById(id, {
            includeDeleted: true,
        });
        if (!result) throw new NotFoundError("Result not found.");
        if (!result.deletedAt) throw new BadRequestError("Result is not archived.");

        const duplicate = await resultRepository.findDuplicate(result);
        if (duplicate) {
            throw new ConflictError(
                "Cannot restore: an active result already exists for this student in the selected scope."
            );
        }

        const restored = await resultRepository.restoreResult(id);
        await this.recalculatePositionsForClass({
            academicYearId: restored.academicYearId,
            termId: restored.termId,
            classId: restored.classId,
        });
        return restored;
    }

    async resolveScopeIds(rawData = {}) {
        if (Array.isArray(rawData.ids) && rawData.ids.length) {
            return rawData.ids.map((id) => Number(id)).filter(Boolean);
        }

        const academicYearId = Number(rawData.academicYearId) || null;
        const termId = Number(rawData.termId) || null;
        const classId = Number(rawData.classId) || null;
        const subjectId = Number(rawData.subjectId) || null;

        if (!academicYearId || !termId || !classId) {
            throw new BadRequestError(
                "Provide result ids, or academicYearId + termId + classId scope."
            );
        }

        const listed = await resultRepository.findResults({
            page: 1,
            limit: 500,
            academicYearId,
            termId,
            classId,
            subjectId,
        });
        return listed.data.map((row) => row.id);
    }

    async verifyResults(rawData = {}, user = null) {
        if (!canVerify(user)) {
            throw new ForbiddenError(
                "Only Administrator, Headmaster, or Registrar can verify results."
            );
        }
        const ids = await this.resolveScopeIds(rawData);
        if (!ids.length) throw new NotFoundError("No results found to verify.");

        const rows = await Promise.all(ids.map((id) => resultRepository.findResultById(id)));
        const eligible = [];
        const skipped = [];

        for (const row of rows) {
            if (!row) continue;
            const status = row.workflowStatus || (row.isPublished ? "PUBLISHED" : "GENERATED");
            if (["VERIFIED", "PUBLISHED", "LOCKED"].includes(status)) {
                skipped.push({ id: row.id, reason: `Already ${status.toLowerCase()}.` });
                continue;
            }
            if (!["DRAFT", "GENERATED"].includes(status)) {
                skipped.push({ id: row.id, reason: `Cannot verify from ${status}.` });
                continue;
            }
            eligible.push(row.id);
        }

        if (!eligible.length) {
            throw new BusinessRuleError(
                "No generated results were eligible for verification."
            );
        }

        const updated = await resultRepository.setVerifyState(eligible, {
            isVerified: true,
            userId: user?.id || null,
        });
        return { updated, skipped, count: updated.length };
    }

    async unverifyResults(rawData = {}, user = null) {
        if (!isAdmin(user)) {
            throw new ForbiddenError("Only an administrator can unverify results.");
        }
        const ids = await this.resolveScopeIds(rawData);
        if (!ids.length) throw new NotFoundError("No results found to unverify.");

        const rows = await Promise.all(ids.map((id) => resultRepository.findResultById(id)));
        const eligible = [];
        const skipped = [];
        for (const row of rows) {
            if (!row) continue;
            if (row.isLocked || row.workflowStatus === "LOCKED") {
                skipped.push({ id: row.id, reason: "Unlock before unverifying." });
                continue;
            }
            if (row.isPublished || row.workflowStatus === "PUBLISHED") {
                skipped.push({ id: row.id, reason: "Unpublish before unverifying." });
                continue;
            }
            eligible.push(row.id);
        }
        if (!eligible.length) {
            throw new BusinessRuleError("No verified results were eligible to unverify.");
        }
        const updated = await resultRepository.setVerifyState(eligible, {
            isVerified: false,
            userId: null,
        });
        return { updated, skipped, count: updated.length };
    }

    async publishResults(rawData = {}, user = null) {
        const ids = await this.resolveScopeIds(rawData);
        if (!ids.length) throw new NotFoundError("No results found to publish.");

        const rows = await Promise.all(ids.map((id) => resultRepository.findResultById(id)));
        const eligible = [];
        const skipped = [];
        for (const row of rows) {
            if (!row) continue;
            if (row.isLocked || row.workflowStatus === "LOCKED") {
                skipped.push({ id: row.id, reason: "Result is locked." });
                continue;
            }
            if (row.isPublished || row.workflowStatus === "PUBLISHED") {
                skipped.push({ id: row.id, reason: "Already published." });
                continue;
            }
            if (!(row.isVerified || row.workflowStatus === "VERIFIED") && !isAdmin(user)) {
                skipped.push({
                    id: row.id,
                    reason: "Result must be verified before publishing.",
                });
                continue;
            }
            eligible.push(row.id);
        }
        if (!eligible.length) {
            throw new BusinessRuleError(
                "No verified results were eligible to publish. Verify results first."
            );
        }

        const updated = await resultRepository.setPublishState(eligible, {
            isPublished: true,
            userId: user?.id || null,
        });
        return { updated, skipped, count: updated.length };
    }

    async unpublishResults(rawData = {}, user = null) {
        if (!isAdmin(user)) {
            throw new ForbiddenError("Only an administrator can unpublish results.");
        }
        const ids = await this.resolveScopeIds(rawData);
        if (!ids.length) throw new NotFoundError("No results found to unpublish.");

        const rows = await Promise.all(ids.map((id) => resultRepository.findResultById(id)));
        const eligible = [];
        const skipped = [];
        for (const row of rows) {
            if (!row) continue;
            if (row.isLocked || row.workflowStatus === "LOCKED") {
                skipped.push({ id: row.id, reason: "Unlock before unpublishing." });
                continue;
            }
            eligible.push(row.id);
        }
        if (!eligible.length) {
            throw new BusinessRuleError("No published results were eligible to unpublish.");
        }
        const updated = await resultRepository.setPublishState(eligible, {
            isPublished: false,
            userId: null,
        });
        return { updated, skipped, count: updated.length };
    }

    async lockResults(rawData = {}, user = null) {
        const ids = await this.resolveScopeIds(rawData);
        if (!ids.length) throw new NotFoundError("No results found to lock.");

        const rows = await Promise.all(ids.map((id) => resultRepository.findResultById(id)));
        const eligible = [];
        const skipped = [];
        for (const row of rows) {
            if (!row) continue;
            if (row.isLocked || row.workflowStatus === "LOCKED") {
                skipped.push({ id: row.id, reason: "Already locked." });
                continue;
            }
            if (!(row.isPublished || row.workflowStatus === "PUBLISHED") && !isAdmin(user)) {
                skipped.push({
                    id: row.id,
                    reason: "Result must be published before locking.",
                });
                continue;
            }
            eligible.push(row.id);
        }
        if (!eligible.length) {
            throw new BusinessRuleError(
                "No published results were eligible to lock. Publish results first."
            );
        }

        const updated = await resultRepository.setLockState(eligible, {
            isLocked: true,
            userId: user?.id || null,
        });
        return { updated, skipped, count: updated.length };
    }

    async unlockResults(rawData = {}, user = null) {
        if (!isAdmin(user)) {
            throw new ForbiddenError("Only an administrator can unlock results.");
        }
        const ids = await this.resolveScopeIds(rawData);
        if (!ids.length) throw new NotFoundError("No results found to unlock.");
        const updated = await resultRepository.setLockState(ids, {
            isLocked: false,
            userId: null,
        });
        return { updated, skipped: [], count: updated.length };
    }

    async recalculatePositions(rawData = {}) {
        const academicYearId = Number(rawData.academicYearId);
        const termId = Number(rawData.termId);
        const classId = Number(rawData.classId);
        if (!academicYearId || !termId || !classId) {
            throw new BadRequestError(
                "academicYearId, termId, and classId are required."
            );
        }
        return this.recalculatePositionsForClass({
            academicYearId,
            termId,
            classId,
            subjectId: Number(rawData.subjectId) || null,
        });
    }

    async getBroadsheet(query = {}) {
        const academicYearId = Number(query.academicYearId);
        const termId = Number(query.termId);
        const classId = Number(query.classId);
        if (!academicYearId || !termId || !classId) {
            throw new BadRequestError(
                "academicYearId, termId, and classId are required for the broadsheet."
            );
        }

        const [academicYear, term, schoolClass] = await Promise.all([
            resultRepository.findAcademicYearById(academicYearId),
            resultRepository.findTermById(termId),
            resultRepository.findSchoolClassById(classId),
        ]);
        if (!academicYear) throw new NotFoundError("Academic year not found.");
        if (!term) throw new NotFoundError("Term not found.");
        if (term.academicYearId !== academicYearId) {
            throw new BadRequestError("Term does not belong to the selected academic year.");
        }
        if (!schoolClass) throw new NotFoundError("School class not found.");
        if (schoolClass.academicYearId !== academicYearId) {
            throw new BadRequestError("Class does not belong to the selected academic year.");
        }

        const rows = await resultRepository.findScopeResults({
            academicYearId,
            termId,
            classId,
            subjectId: Number(query.subjectId) || null,
        });

        const subjectMap = new Map();
        const studentMap = new Map();

        for (const row of rows) {
            if (!subjectMap.has(row.subjectId)) {
                subjectMap.set(row.subjectId, {
                    id: row.subjectId,
                    subjectCode: row.subject?.subjectCode || null,
                    subjectName: row.subject?.subjectName || `Subject #${row.subjectId}`,
                });
            }
            if (!studentMap.has(row.studentId)) {
                studentMap.set(row.studentId, {
                    studentId: row.studentId,
                    admissionNo: row.student?.admissionNo || null,
                    studentName: studentDisplayName(row.student || {}),
                    classPosition: row.classPosition,
                    classAverage: row.classAverage,
                    cells: {},
                    totalScore: 0,
                    subjectCount: 0,
                    passedCount: 0,
                });
            }
            const student = studentMap.get(row.studentId);
            student.cells[row.subjectId] = {
                resultId: row.id,
                finalScore: row.finalScore,
                grade: row.gradeLetter || row.grade?.grade || null,
                isPassed: row.isPassed,
                subjectPosition: row.subjectPosition,
                workflowStatus: row.workflowStatus,
                remarks: row.remarks,
            };
            student.totalScore += Number(row.finalScore || 0);
            student.subjectCount += 1;
            if (row.isPassed) student.passedCount += 1;
            if (row.classPosition != null) student.classPosition = row.classPosition;
            if (row.classAverage != null) student.classAverage = row.classAverage;
        }

        const students = Array.from(studentMap.values())
            .map((student) => ({
                ...student,
                average:
                    student.subjectCount > 0
                        ? round1(student.totalScore / student.subjectCount)
                        : 0,
            }))
            .sort((a, b) => {
                const posA = a.classPosition ?? Number.MAX_SAFE_INTEGER;
                const posB = b.classPosition ?? Number.MAX_SAFE_INTEGER;
                if (posA !== posB) return posA - posB;
                return (a.studentName || "").localeCompare(b.studentName || "");
            });

        return {
            academicYear,
            term,
            schoolClass,
            subjects: Array.from(subjectMap.values()).sort((a, b) =>
                (a.subjectName || "").localeCompare(b.subjectName || "")
            ),
            students,
            meta: {
                studentCount: students.length,
                subjectCount: subjectMap.size,
                resultCount: rows.length,
            },
        };
    }

    async getMeritList(query = {}) {
        const academicYearId = Number(query.academicYearId);
        const termId = Number(query.termId);
        const classId = Number(query.classId);
        const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));

        if (!academicYearId || !termId || !classId) {
            throw new BadRequestError(
                "academicYearId, termId, and classId are required for the merit list."
            );
        }

        const [academicYear, term, schoolClass] = await Promise.all([
            resultRepository.findAcademicYearById(academicYearId),
            resultRepository.findTermById(termId),
            resultRepository.findSchoolClassById(classId),
        ]);
        if (!academicYear) throw new NotFoundError("Academic year not found.");
        if (!term) throw new NotFoundError("Term not found.");
        if (!schoolClass) throw new NotFoundError("School class not found.");

        const rows = await resultRepository.findScopeResults({
            academicYearId,
            termId,
            classId,
        });

        const byStudent = new Map();
        for (const row of rows) {
            if (!byStudent.has(row.studentId)) {
                byStudent.set(row.studentId, {
                    studentId: row.studentId,
                    admissionNo: row.student?.admissionNo || null,
                    studentName: studentDisplayName(row.student || {}),
                    scores: [],
                    passedCount: 0,
                    failedCount: 0,
                    classPosition: row.classPosition,
                });
            }
            const bucket = byStudent.get(row.studentId);
            bucket.scores.push(Number(row.finalScore || 0));
            if (row.isPassed) bucket.passedCount += 1;
            else bucket.failedCount += 1;
            if (row.classPosition != null) bucket.classPosition = row.classPosition;
        }

        const ranked = Array.from(byStudent.values())
            .map((item) => ({
                studentId: item.studentId,
                admissionNo: item.admissionNo,
                studentName: item.studentName,
                subjectCount: item.scores.length,
                passedCount: item.passedCount,
                failedCount: item.failedCount,
                average:
                    item.scores.length > 0
                        ? round1(
                              item.scores.reduce((sum, value) => sum + value, 0) /
                                  item.scores.length
                          )
                        : 0,
                classPosition: item.classPosition,
            }))
            .sort((a, b) => {
                if (b.average !== a.average) return b.average - a.average;
                return (a.studentName || "").localeCompare(b.studentName || "");
            })
            .slice(0, limit)
            .map((item, index) => ({
                ...item,
                meritPosition: index + 1,
            }));

        return {
            academicYear,
            term,
            schoolClass,
            limit,
            ranks: ranked,
            meta: {
                totalStudents: byStudent.size,
                listed: ranked.length,
            },
        };
    }

    async getStudentProfile(studentId, query = {}) {
        const id = Number(studentId);
        if (!id) throw new BadRequestError("Student id is required.");

        const student = await resultRepository.findStudentById(id);
        if (!student) throw new NotFoundError("Student not found.");

        const academicYearId = Number(query.academicYearId) || null;
        const termId = Number(query.termId) || null;
        const classId = Number(query.classId) || student.classId || null;

        const listed = await resultRepository.findResults({
            page: 1,
            limit: 200,
            studentId: id,
            academicYearId,
            termId,
            classId,
            sortBy: "subjectName",
            sortOrder: "asc",
        });

        const subjects = listed.data;
        const scores = subjects.map((row) => Number(row.finalScore || 0));
        const average =
            scores.length > 0
                ? round1(scores.reduce((sum, value) => sum + value, 0) / scores.length)
                : 0;

        return {
            student,
            filters: { academicYearId, termId, classId },
            subjects,
            summary: {
                subjectCount: subjects.length,
                average,
                passedCount: subjects.filter((row) => row.isPassed).length,
                failedCount: subjects.filter((row) => !row.isPassed).length,
                classPosition: subjects[0]?.classPosition ?? null,
                classAverage: subjects[0]?.classAverage ?? null,
                workflow: {
                    verified: subjects.filter((row) => row.isVerified).length,
                    published: subjects.filter((row) => row.isPublished).length,
                    locked: subjects.filter((row) => row.isLocked).length,
                },
            },
        };
    }
}

module.exports = new ResultService();
