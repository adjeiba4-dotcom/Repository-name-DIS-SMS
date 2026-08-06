const examinationRepository = require("../repositories/examination.repository");
const { applyDateFields, toDate } = require("../utils/date");
const { BadRequestError, NotFoundError, ConflictError, BusinessRuleError, ForbiddenError } = require("../errors");

const EXAMINATION_TYPES = ["MID_TERM", "END_OF_TERM", "MOCK", "FINAL", "ENTRANCE"];
const STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const SUMMARY_SCOPES = ["overview", "class", "subject", "teacher", "type", "student"];
const ID_FIELDS = new Set(["academicYearId", "termId", "classId", "subjectId", "teacherId"]);

function utcDay(value) {
    const date = value instanceof Date ? value : toDate(value);
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new BadRequestError("Examination date must be a valid date.");
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
const formatDate = (date) => utcDay(date).toISOString().slice(0, 10);
const within = (date, start, end) => utcDay(date) >= utcDay(start) && utcDay(date) <= utcDay(end);
const round1 = (value) => Math.round(Number(value || 0) * 10) / 10;
function validateType(value) { if (!value || !EXAMINATION_TYPES.includes(value)) throw new BadRequestError(`Examination type must be one of: ${EXAMINATION_TYPES.join(", ")}.`); }
function validateStatus(value) { if (value && !STATUS_VALUES.includes(value)) throw new BadRequestError("Status must be ACTIVE or INACTIVE."); }
function positiveMarks(value, label) {
    if (value == null || Number.isNaN(Number(value)) || Number(value) <= 0 || Number(value) > 9999.99) throw new BadRequestError(`${label} must be greater than 0 and cannot exceed 9999.99.`);
    return Number(value);
}
function validateScore(value, maxMarks) {
    if (value == null || value === "" || Number.isNaN(Number(value))) throw new BadRequestError("Marks are required.");
    const marks = Number(value);
    if (marks < 0) throw new BusinessRuleError("Scores cannot be negative.");
    if (marks > Number(maxMarks)) throw new BusinessRuleError(`Scores cannot exceed the maximum marks (${maxMarks}).`);
    return marks;
}
function sanitize(data = {}) {
    const payload = {};
    for (const field of ["name", "academicYearId", "termId", "classId", "subjectId", "teacherId", "examinationType", "maxMarks", "passingMarks", "durationMinutes", "examinationDate", "remarks", "status"]) {
        const source = field === "passingMarks" && data.passingMarks === undefined ? data.passMarks : data[field];
        if (source === undefined) continue;
        if (ID_FIELDS.has(field)) { if (source !== "" && source !== null) payload[field] = parseInt(source, 10); }
        else if (["maxMarks", "passingMarks", "durationMinutes"].includes(field)) payload[field] = source === null || source === "" ? null : Number(source);
        else if (["examinationType", "status"].includes(field)) payload[field] = String(source).trim().toUpperCase();
        else if (["name", "remarks"].includes(field)) payload[field] = source === null ? null : String(source).trim() || null;
        else payload[field] = source;
    }
    return applyDateFields(payload, ["examinationDate"]);
}

class ExaminationService {
    async getExaminations(query = {}) {
        const examinationType = query.examinationType ? String(query.examinationType).trim().toUpperCase() : null;
        const status = query.status ? String(query.status).trim().toUpperCase() : null;
        if (examinationType) validateType(examinationType);
        if (status) validateStatus(status);
        const dateFrom = query.dateFrom ? utcDay(query.dateFrom) : null;
        const dateTo = query.dateTo ? utcDay(query.dateTo) : null;
        if (dateFrom && dateTo && dateFrom > dateTo) throw new BadRequestError("dateFrom must be on or before dateTo.");
        const isLocked =
            query.isLocked === undefined || query.isLocked === null || query.isLocked === ""
                ? null
                : ["true", true, "1", 1].includes(query.isLocked)
                  ? true
                  : ["false", false, "0", 0].includes(query.isLocked)
                    ? false
                    : null;
        return examinationRepository.findExaminations({
            page: Math.max(1, parseInt(query.page, 10) || 1), limit: Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20)),
            search: (query.search || query.keyword || "").trim(), examinationType, status, isLocked,
            academicYearId: Number(query.academicYearId) || null, termId: Number(query.termId) || null, classId: Number(query.classId) || null,
            subjectId: Number(query.subjectId) || null, teacherId: Number(query.teacherId) || null,
            examinationDate: query.examinationDate ? utcDay(query.examinationDate) : null, dateFrom, dateTo,
            sortBy: (query.sortBy || "examinationDate").trim(), sortOrder: (query.sortOrder || "desc").trim().toLowerCase(),
        });
    }
    async getArchivedExaminations(query = {}) { return examinationRepository.findExaminations({ page: Math.max(1, parseInt(query.page, 10) || 1), limit: Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20)), search: (query.search || query.keyword || "").trim(), onlyDeleted: true, sortBy: "updatedAt", sortOrder: "desc" }); }
    async getExaminationById(id) { const examination = await examinationRepository.findExaminationById(id); if (!examination) throw new NotFoundError("Examination not found."); return examination; }
    assertEditable(examination, user) { if (examination.isLocked && user?.role?.name !== "Administrator") throw new ForbiddenError("This examination is locked and can only be modified by an administrator."); }

    async assertRelatedEntities(data) {
        const [academicYear, term, schoolClass, subject, teacher] = await Promise.all([examinationRepository.findAcademicYearById(data.academicYearId), examinationRepository.findTermById(data.termId), examinationRepository.findSchoolClassById(data.classId), examinationRepository.findSubjectById(data.subjectId), examinationRepository.findTeacherById(data.teacherId)]);
        if (!academicYear) throw new NotFoundError("Academic year not found.");
        if (!term) throw new NotFoundError("Term not found.");
        if (term.academicYearId !== data.academicYearId) throw new BadRequestError("Term does not belong to the selected academic year.");
        if (!schoolClass) throw new NotFoundError("School class not found.");
        if (schoolClass.academicYearId !== data.academicYearId) throw new BadRequestError("Class does not belong to the selected academic year.");
        if (!subject) throw new NotFoundError("Subject not found.");
        if (!teacher) throw new NotFoundError("Teacher not found.");
        if (!within(data.examinationDate, academicYear.startDate, academicYear.endDate)) throw new BusinessRuleError("Examination date must fall within the selected academic year.");
        if (!within(data.examinationDate, term.startDate, term.endDate)) throw new BusinessRuleError("Examination date must fall within the selected term.");
        const classSubject = await examinationRepository.findActiveClassSubject({ schoolClassId: data.classId, subjectId: data.subjectId, academicYearId: data.academicYearId, termId: data.termId });
        if (!classSubject) throw new BusinessRuleError("Subject is not allocated to this class for the selected academic year and term.");
        const teacherSubject = await examinationRepository.findActiveTeacherSubject({ teacherId: data.teacherId, subjectId: data.subjectId, academicYearId: data.academicYearId, termId: data.termId });
        if (!teacherSubject) throw new ForbiddenError("Only teachers assigned to this subject for the selected year/term can record examination marks.");
        if (classSubject.teacherSubject && classSubject.teacherSubject.teacherId !== data.teacherId) throw new ForbiddenError("Selected teacher does not match the teacher assigned on the class subject allocation.");
    }
    validateExamData(data) {
        for (const [field, label] of [["academicYearId", "Academic year"], ["termId", "Term"], ["classId", "Class"], ["subjectId", "Subject"], ["teacherId", "Teacher"], ["examinationDate", "Examination date"]]) if (!data[field]) throw new BadRequestError(`${label} is required.`);
        validateType(data.examinationType); validateStatus(data.status);
        data.maxMarks = positiveMarks(data.maxMarks, "Maximum marks");
        data.passingMarks = positiveMarks(data.passingMarks, "Passing marks");
        if (data.passingMarks > data.maxMarks) throw new BusinessRuleError("Passing marks cannot exceed maximum marks.");
        if (data.durationMinutes != null) {
            const duration = Number(data.durationMinutes);
            if (!Number.isInteger(duration) || duration <= 0 || duration > 1440) {
                throw new BadRequestError("Duration minutes must be an integer between 1 and 1440.");
            }
            data.durationMinutes = duration;
        }
        data.examinationDate = utcDay(data.examinationDate); data.status = data.status || "ACTIVE";
    }
    async createExamination(rawData, user) {
        const data = sanitize(rawData); this.validateExamData(data); await this.assertRelatedEntities(data);
        const duplicate = await examinationRepository.findDuplicate(data);
        if (duplicate) throw new ConflictError("An examination already exists for this class, subject, type, and date.");
        if (!data.name) data.name = `${data.examinationType.replace(/_/g, " ")} · ${formatDate(data.examinationDate)}`;
        return examinationRepository.createExamination(data);
    }
    async updateExamination(id, rawData, user) {
        const existing = await this.getExaminationById(id); this.assertEditable(existing, user);
        const data = sanitize(rawData);
        const next = { ...existing, ...data, examinationDate: data.examinationDate !== undefined ? utcDay(data.examinationDate) : utcDay(existing.examinationDate) };
        this.validateExamData(next); await this.assertRelatedEntities(next);
        if (Number(next.maxMarks) < Math.max(...(existing.scores || []).map((score) => Number(score.marks)), 0)) throw new BusinessRuleError("Maximum marks cannot be lower than an already recorded student score.");
        if (Number(next.passingMarks) > Number(next.maxMarks)) throw new BusinessRuleError("Passing marks cannot exceed maximum marks.");
        const duplicate = await examinationRepository.findDuplicate({ ...next, excludeId: id });
        if (duplicate) throw new ConflictError("An examination already exists for this class, subject, type, and date.");
        return examinationRepository.updateExamination(id, next);
    }
    async archiveExamination(id, user) { const examination = await this.getExaminationById(id); this.assertEditable(examination, user); return examinationRepository.softDeleteExamination(id); }
    async restoreExamination(id, user) {
        const examination = await examinationRepository.findExaminationById(id, { includeDeleted: true });
        if (!examination) throw new NotFoundError("Examination not found.");
        this.assertEditable(examination, user);
        if (!examination.deletedAt) throw new BadRequestError("Examination is not archived.");
        if (await examinationRepository.findDuplicate({ ...examination, examinationDate: utcDay(examination.examinationDate), excludeId: id })) throw new ConflictError("Cannot restore: an active examination already exists for this class, subject, type, and date.");
        return examinationRepository.restoreExamination(id);
    }
    async lockExamination(id, user = null) {
        const examination = await this.getExaminationById(id);
        if (examination.isLocked) throw new BadRequestError("Examination is already locked.");
        return examinationRepository.setLockState(id, {
            isLocked: true,
            userId: user?.id || null,
        });
    }
    async unlockExamination(id, user = null) {
        if (user?.role?.name !== "Administrator") {
            throw new ForbiddenError("Only an administrator can unlock an examination.");
        }
        const examination = await this.getExaminationById(id);
        if (!examination.isLocked) throw new BadRequestError("Examination is not locked.");
        return examinationRepository.setLockState(id, { isLocked: false, userId: null });
    }
    async getRoster(id) {
        const examination = await this.getExaminationById(id);
        const enrollments = await examinationRepository.findEnrolledStudents({ academicYearId: examination.academicYearId, schoolClassId: examination.classId, termId: examination.termId });
        const scoreByStudent = new Map((examination.scores || []).map((score) => [score.studentId, score]));
        let marked = 0; let totalMarks = 0; let passCount = 0;
        const passThreshold = Number(examination.passingMarks);
        const students = enrollments.map((enrollment) => {
            const score = scoreByStudent.get(enrollment.studentId) || null;
            if (score) {
                marked += 1;
                totalMarks += Number(score.marks);
                if (Number(score.marks) >= passThreshold) passCount += 1;
            }
            return {
                enrollmentId: enrollment.id,
                enrollmentNumber: enrollment.enrollmentNumber,
                studentId: enrollment.studentId,
                admissionNo: enrollment.student?.admissionNo || "",
                firstName: enrollment.student?.firstName || "",
                lastName: enrollment.student?.lastName || "",
                otherName: enrollment.student?.otherName || null,
                gender: enrollment.student?.gender || null,
                score: score
                    ? {
                          id: score.id,
                          marks: score.marks,
                          remarks: score.remarks,
                          percentage: round1(
                              (Number(score.marks) / Number(examination.maxMarks)) * 100
                          ),
                          passed: Number(score.marks) >= passThreshold,
                          updatedAt: score.updatedAt,
                      }
                    : null,
            };
        });
        return {
            examination,
            students,
            summary: {
                enrolled: enrollments.length,
                marked,
                unmarked: Math.max(enrollments.length - marked, 0),
                averageMarks: marked ? round1(totalMarks / marked) : 0,
                averagePercentage: marked
                    ? round1((totalMarks / (marked * Number(examination.maxMarks))) * 100)
                    : 0,
                passCount,
                failCount: Math.max(marked - passCount, 0),
                passingMarks: passThreshold,
                passThreshold,
            },
        };
    }
    async bulkScores(id, rawData = {}, user) {
        const examination = await this.getExaminationById(id); this.assertEditable(examination, user);
        const action = String(rawData.action || "UPSERT").trim().toUpperCase();
        if (!["UPSERT", "CLEAR"].includes(action)) throw new BadRequestError("Score action must be UPSERT or CLEAR.");
        await this.assertRelatedEntities(examination);
        if (action === "CLEAR") { const result = await examinationRepository.deleteScoresForExamination(id); return { action, examinationId: Number(id), cleared: result.count, upserted: 0, scores: [] }; }
        const entries = Array.isArray(rawData.entries) ? rawData.entries : [];
        if (!entries.length) throw new BadRequestError("At least one score entry is required.");
        const enrolledIds = new Set((await examinationRepository.findEnrolledStudents({ academicYearId: examination.academicYearId, schoolClassId: examination.classId, termId: examination.termId })).map((entry) => entry.studentId));
        const scores = [];
        for (const entry of entries) { const studentId = parseInt(entry.studentId, 10); if (!studentId) throw new BadRequestError("Each score entry requires a valid studentId."); if (!enrolledIds.has(studentId)) throw new BusinessRuleError(`Student #${studentId} is not enrolled in this class for the selected year/term.`); if (entry.marks === null || entry.marks === "") { await examinationRepository.deleteScore(id, studentId); continue; } scores.push(await examinationRepository.upsertScore({ examinationId: id, studentId, marks: validateScore(entry.marks, examination.maxMarks), remarks: entry.remarks == null ? null : String(entry.remarks).trim() || null })); }
        return { action, examinationId: Number(id), cleared: 0, upserted: scores.length, scores };
    }
    async getStats(query = {}) {
        const scope = String(query.scope || "overview").trim().toLowerCase();
        if (!SUMMARY_SCOPES.includes(scope)) throw new BadRequestError(`Summary scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`);
        const examinationType = query.examinationType ? String(query.examinationType).trim().toUpperCase() : null; if (examinationType) validateType(examinationType);
        const dateFrom = query.dateFrom ? utcDay(query.dateFrom) : null; const dateTo = query.dateTo ? utcDay(query.dateTo) : null;
        if (dateFrom && dateTo && dateFrom > dateTo) throw new BadRequestError("dateFrom must be on or before dateTo.");
        const filters = { academicYearId: Number(query.academicYearId) || null, termId: Number(query.termId) || null, classId: Number(query.classId) || null, subjectId: Number(query.subjectId) || null, teacherId: Number(query.teacherId) || null, examinationType, dateFrom, dateTo };
        const [overview, examinations] = await Promise.all([examinationRepository.getScoreStats(filters), examinationRepository.getExaminationsForAnalytics(filters)]);
        return { scope, filters: { ...filters, dateFrom: dateFrom && formatDate(dateFrom), dateTo: dateTo && formatDate(dateTo) }, overview: { examinations: overview.examinationCount, scores: overview.scoreCount, averageMarks: round1(overview.averageMarks), minMarks: overview.minMarks, maxMarksRecorded: overview.maxMarksRecorded, byType: overview.byType }, breakdown: this.buildBreakdown(scope, examinations) };
    }
    buildBreakdown(scope, examinations) { const buckets = new Map(); for (const examination of examinations) { const entity = scope === "class" ? examination.schoolClass : scope === "subject" ? examination.subject : scope === "teacher" ? examination.teacher : null; const key = scope === "student" ? null : scope === "type" || scope === "overview" ? examination.examinationType : String(examination[`${scope}Id`]); const add = (bucketKey, label, score) => { if (!buckets.has(bucketKey)) buckets.set(bucketKey, { key: bucketKey, label, examinations: 0, scores: 0, totalMarks: 0, averageMarks: 0 }); const bucket = buckets.get(bucketKey); if (score) { bucket.scores += 1; bucket.totalMarks += Number(score.marks); } return bucket; }; if (scope === "student") for (const score of examination.scores) { const bucket = add(String(score.studentId), `Student #${score.studentId}`, score); bucket.examinations += 1; } else { const label = entity ? (scope === "teacher" ? [entity.firstName, entity.lastName].filter(Boolean).join(" ") || entity.staffNo : entity.subjectName || entity.className || entity.subjectCode || entity.classCode) : examination.examinationType; const bucket = add(key, label); bucket.examinations += 1; for (const score of examination.scores) add(key, label, score); } } return [...buckets.values()].map((bucket) => ({ ...bucket, averageMarks: bucket.scores ? round1(bucket.totalMarks / bucket.scores) : 0 })); }
}
module.exports = new ExaminationService();
