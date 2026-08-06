// services/assessment.service.js

const assessmentRepository = require("../repositories/assessment.repository");
const { applyDateFields, toDate } = require("../utils/date");
const {
    BadRequestError,
    NotFoundError,
    ConflictError,
    BusinessRuleError,
    ForbiddenError,
} = require("../errors");

const ASSESSMENT_TYPES = [
    "CLASS_WORK",
    "HOMEWORK",
    "QUIZ",
    "ASSIGNMENT",
    "PRACTICAL",
    "PROJECT",
    "ORAL_TEST",
    "MID_TERM",
    "CONTINUOUS_ASSESSMENT",
];

const STATUS_VALUES = ["ACTIVE", "INACTIVE"];
const SUMMARY_SCOPES = [
    "overview",
    "class",
    "subject",
    "teacher",
    "type",
    "student",
];

const PAYLOAD_FIELDS = [
    "title",
    "academicYearId",
    "termId",
    "classId",
    "subjectId",
    "teacherId",
    "assessmentType",
    "maxMarks",
    "assessmentDate",
    "remarks",
    "status",
];

function sanitizeAssessmentData(data = {}) {
    const payload = {};

    for (const field of PAYLOAD_FIELDS) {
        if (data[field] === undefined) continue;

        if (
            [
                "academicYearId",
                "termId",
                "classId",
                "subjectId",
                "teacherId",
            ].includes(field)
        ) {
            if (data[field] === null || data[field] === "") continue;
            payload[field] = parseInt(data[field], 10);
            continue;
        }

        if (field === "assessmentType" || field === "status") {
            payload[field] = String(data[field]).trim().toUpperCase();
            continue;
        }

        if (field === "maxMarks") {
            payload[field] = Number(data[field]);
            continue;
        }

        if (field === "title" || field === "remarks") {
            if (data[field] === null) {
                payload[field] = null;
            } else {
                const trimmed = String(data[field]).trim();
                payload[field] = trimmed === "" ? null : trimmed;
            }
            continue;
        }

        payload[field] = data[field];
    }

    return applyDateFields(payload, ["assessmentDate"]);
}

function toUtcDayStart(date) {
    const value = date instanceof Date ? date : toDate(date);
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        throw new BadRequestError("Assessment date must be a valid date.");
    }
    return new Date(
        Date.UTC(
            value.getUTCFullYear(),
            value.getUTCMonth(),
            value.getUTCDate()
        )
    );
}

function formatDateKey(date) {
    return toUtcDayStart(date).toISOString().slice(0, 10);
}

function isDateWithinRange(date, startDate, endDate) {
    const day = toUtcDayStart(date).getTime();
    const start = toUtcDayStart(startDate).getTime();
    const end = toUtcDayStart(endDate).getTime();
    return day >= start && day <= end;
}

function assertValidType(type) {
    if (!type || !ASSESSMENT_TYPES.includes(type)) {
        throw new BadRequestError(
            `Assessment type must be one of: ${ASSESSMENT_TYPES.join(", ")}.`
        );
    }
}

function assertValidStatus(status) {
    if (status && !STATUS_VALUES.includes(status)) {
        throw new BadRequestError("Status must be ACTIVE or INACTIVE.");
    }
}

function assertValidMaxMarks(maxMarks) {
    if (maxMarks == null || Number.isNaN(Number(maxMarks))) {
        throw new BadRequestError("Maximum marks are required.");
    }
    const value = Number(maxMarks);
    if (value <= 0) {
        throw new BadRequestError("Maximum marks must be greater than zero.");
    }
    if (value > 9999.99) {
        throw new BadRequestError("Maximum marks cannot exceed 9999.99.");
    }
    return value;
}

function assertValidScore(marks, maxMarks) {
    if (marks == null || marks === "" || Number.isNaN(Number(marks))) {
        throw new BadRequestError("Marks are required.");
    }
    const value = Number(marks);
    if (value < 0) {
        throw new BusinessRuleError("Scores cannot be negative.");
    }
    if (value > Number(maxMarks)) {
        throw new BusinessRuleError(
            `Scores cannot exceed the maximum marks (${maxMarks}).`
        );
    }
    return value;
}

function round1(value) {
    return Math.round(Number(value || 0) * 10) / 10;
}

class AssessmentService {
    async getAssessments(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();
        const academicYearId = query.academicYearId
            ? parseInt(query.academicYearId, 10)
            : null;
        const termId = query.termId ? parseInt(query.termId, 10) : null;
        const classId = query.classId ? parseInt(query.classId, 10) : null;
        const subjectId = query.subjectId
            ? parseInt(query.subjectId, 10)
            : null;
        const teacherId = query.teacherId
            ? parseInt(query.teacherId, 10)
            : null;
        const assessmentType = query.assessmentType
            ? String(query.assessmentType).trim().toUpperCase()
            : null;
        const status = query.status
            ? String(query.status).trim().toUpperCase()
            : null;
        const sortBy = (query.sortBy || "assessmentDate").trim();
        const sortOrder = (query.sortOrder || "desc").trim().toLowerCase();

        if (assessmentType) assertValidType(assessmentType);
        if (status) assertValidStatus(status);

        const assessmentDate = query.assessmentDate
            ? toUtcDayStart(query.assessmentDate)
            : null;
        const dateFrom = query.dateFrom ? toUtcDayStart(query.dateFrom) : null;
        const dateTo = query.dateTo ? toUtcDayStart(query.dateTo) : null;

        if (dateFrom && dateTo && dateFrom > dateTo) {
            throw new BadRequestError("dateFrom must be on or before dateTo.");
        }

        return assessmentRepository.findAssessments({
            page,
            limit,
            search,
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
            termId: termId && !Number.isNaN(termId) ? termId : null,
            classId: classId && !Number.isNaN(classId) ? classId : null,
            subjectId:
                subjectId && !Number.isNaN(subjectId) ? subjectId : null,
            teacherId:
                teacherId && !Number.isNaN(teacherId) ? teacherId : null,
            assessmentType,
            status,
            assessmentDate,
            dateFrom,
            dateTo,
            sortBy,
            sortOrder,
        });
    }

    async getArchivedAssessments(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();

        return assessmentRepository.findAssessments({
            page,
            limit,
            search,
            onlyDeleted: true,
            sortBy: "updatedAt",
            sortOrder: "desc",
        });
    }

    async getAssessmentById(id) {
        const assessment = await assessmentRepository.findAssessmentById(id);
        if (!assessment) {
            throw new NotFoundError("Assessment not found.");
        }
        return assessment;
    }

    async getRoster(id) {
        const assessment = await this.getAssessmentById(id);
        const enrollments = await assessmentRepository.findEnrolledStudents({
            academicYearId: assessment.academicYearId,
            schoolClassId: assessment.classId,
            termId: assessment.termId,
        });

        const scoreByStudent = new Map(
            (assessment.scores || []).map((score) => [score.studentId, score])
        );

        let marked = 0;
        let totalMarks = 0;
        let passCount = 0;
        const passThreshold = Number(assessment.maxMarks) * 0.4;

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
                              (Number(score.marks) /
                                  Number(assessment.maxMarks)) *
                                  100
                          ),
                          updatedAt: score.updatedAt,
                      }
                    : null,
            };
        });

        return {
            assessment,
            students,
            summary: {
                enrolled: enrollments.length,
                marked,
                unmarked: Math.max(enrollments.length - marked, 0),
                averageMarks: marked > 0 ? round1(totalMarks / marked) : 0,
                averagePercentage:
                    marked > 0
                        ? round1(
                              (totalMarks /
                                  (marked * Number(assessment.maxMarks))) *
                                  100
                          )
                        : 0,
                passCount,
                failCount: Math.max(marked - passCount, 0),
            },
        };
    }

    async getStats(query = {}) {
        const scope = String(query.scope || "overview")
            .trim()
            .toLowerCase();
        if (!SUMMARY_SCOPES.includes(scope)) {
            throw new BadRequestError(
                `Summary scope must be one of: ${SUMMARY_SCOPES.join(", ")}.`
            );
        }

        const academicYearId = query.academicYearId
            ? parseInt(query.academicYearId, 10)
            : null;
        const termId = query.termId ? parseInt(query.termId, 10) : null;
        const classId = query.classId ? parseInt(query.classId, 10) : null;
        const subjectId = query.subjectId
            ? parseInt(query.subjectId, 10)
            : null;
        const teacherId = query.teacherId
            ? parseInt(query.teacherId, 10)
            : null;
        const assessmentType = query.assessmentType
            ? String(query.assessmentType).trim().toUpperCase()
            : null;

        if (assessmentType) assertValidType(assessmentType);

        const dateFrom = query.dateFrom ? toUtcDayStart(query.dateFrom) : null;
        const dateTo = query.dateTo ? toUtcDayStart(query.dateTo) : null;

        const filters = {
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
            termId: termId && !Number.isNaN(termId) ? termId : null,
            classId: classId && !Number.isNaN(classId) ? classId : null,
            subjectId:
                subjectId && !Number.isNaN(subjectId) ? subjectId : null,
            teacherId:
                teacherId && !Number.isNaN(teacherId) ? teacherId : null,
            assessmentType,
            dateFrom,
            dateTo,
        };

        const [overview, assessments] = await Promise.all([
            assessmentRepository.getScoreStats(filters),
            assessmentRepository.getAssessmentsForAnalytics(filters),
        ]);

        return {
            scope,
            filters: {
                ...filters,
                dateFrom: dateFrom ? formatDateKey(dateFrom) : null,
                dateTo: dateTo ? formatDateKey(dateTo) : null,
            },
            overview: {
                assessments: overview.assessmentCount,
                scores: overview.scoreCount,
                averageMarks: round1(overview.averageMarks),
                minMarks: overview.minMarks,
                maxMarksRecorded: overview.maxMarksRecorded,
                byType: overview.byType,
            },
            breakdown: this.buildBreakdown(scope, assessments),
        };
    }

    buildBreakdown(scope, assessments = []) {
        if (scope === "overview" || scope === "type") {
            const byType = new Map();
            for (const assessment of assessments) {
                const key = assessment.assessmentType;
                if (!byType.has(key)) {
                    byType.set(key, {
                        key,
                        label: key,
                        assessments: 0,
                        scores: 0,
                        totalMarks: 0,
                        averageMarks: 0,
                        averagePercentage: 0,
                    });
                }
                const bucket = byType.get(key);
                bucket.assessments += 1;
                for (const score of assessment.scores || []) {
                    bucket.scores += 1;
                    bucket.totalMarks += Number(score.marks);
                }
            }
            return [...byType.values()].map((bucket) => {
                bucket.averageMarks =
                    bucket.scores > 0
                        ? round1(bucket.totalMarks / bucket.scores)
                        : 0;
                return bucket;
            });
        }

        if (scope === "class") {
            const byClass = new Map();
            for (const assessment of assessments) {
                const key = String(assessment.classId);
                if (!byClass.has(key)) {
                    const schoolClass = assessment.schoolClass || {};
                    byClass.set(key, {
                        key,
                        classId: assessment.classId,
                        label:
                            schoolClass.className && schoolClass.classCode
                                ? `${schoolClass.className} (${schoolClass.classCode})`
                                : schoolClass.className ||
                                  schoolClass.classCode ||
                                  `Class #${assessment.classId}`,
                        assessments: 0,
                        scores: 0,
                        totalMarks: 0,
                        averageMarks: 0,
                    });
                }
                const bucket = byClass.get(key);
                bucket.assessments += 1;
                for (const score of assessment.scores || []) {
                    bucket.scores += 1;
                    bucket.totalMarks += Number(score.marks);
                }
            }
            return [...byClass.values()].map((bucket) => {
                bucket.averageMarks =
                    bucket.scores > 0
                        ? round1(bucket.totalMarks / bucket.scores)
                        : 0;
                return bucket;
            });
        }

        if (scope === "subject") {
            const bySubject = new Map();
            for (const assessment of assessments) {
                const key = String(assessment.subjectId);
                if (!bySubject.has(key)) {
                    const subject = assessment.subject || {};
                    bySubject.set(key, {
                        key,
                        subjectId: assessment.subjectId,
                        label:
                            subject.subjectName && subject.subjectCode
                                ? `${subject.subjectName} (${subject.subjectCode})`
                                : subject.subjectName ||
                                  subject.subjectCode ||
                                  `Subject #${assessment.subjectId}`,
                        assessments: 0,
                        scores: 0,
                        totalMarks: 0,
                        averageMarks: 0,
                    });
                }
                const bucket = bySubject.get(key);
                bucket.assessments += 1;
                for (const score of assessment.scores || []) {
                    bucket.scores += 1;
                    bucket.totalMarks += Number(score.marks);
                }
            }
            return [...bySubject.values()].map((bucket) => {
                bucket.averageMarks =
                    bucket.scores > 0
                        ? round1(bucket.totalMarks / bucket.scores)
                        : 0;
                return bucket;
            });
        }

        if (scope === "teacher") {
            const byTeacher = new Map();
            for (const assessment of assessments) {
                const key = String(assessment.teacherId);
                if (!byTeacher.has(key)) {
                    const teacher = assessment.teacher || {};
                    const name = [teacher.firstName, teacher.lastName]
                        .filter(Boolean)
                        .join(" ");
                    byTeacher.set(key, {
                        key,
                        teacherId: assessment.teacherId,
                        label: name
                            ? `${name}${
                                  teacher.staffNo
                                      ? ` (${teacher.staffNo})`
                                      : ""
                              }`
                            : teacher.staffNo ||
                              `Teacher #${assessment.teacherId}`,
                        assessments: 0,
                        scores: 0,
                        totalMarks: 0,
                        averageMarks: 0,
                    });
                }
                const bucket = byTeacher.get(key);
                bucket.assessments += 1;
                for (const score of assessment.scores || []) {
                    bucket.scores += 1;
                    bucket.totalMarks += Number(score.marks);
                }
            }
            return [...byTeacher.values()].map((bucket) => {
                bucket.averageMarks =
                    bucket.scores > 0
                        ? round1(bucket.totalMarks / bucket.scores)
                        : 0;
                return bucket;
            });
        }

        // student
        const byStudent = new Map();
        for (const assessment of assessments) {
            for (const score of assessment.scores || []) {
                const key = String(score.studentId);
                if (!byStudent.has(key)) {
                    byStudent.set(key, {
                        key,
                        studentId: score.studentId,
                        label: `Student #${score.studentId}`,
                        assessments: 0,
                        scores: 0,
                        totalMarks: 0,
                        averageMarks: 0,
                    });
                }
                const bucket = byStudent.get(key);
                bucket.scores += 1;
                bucket.assessments += 1;
                bucket.totalMarks += Number(score.marks);
            }
        }
        return [...byStudent.values()].map((bucket) => {
            bucket.averageMarks =
                bucket.scores > 0
                    ? round1(bucket.totalMarks / bucket.scores)
                    : 0;
            return bucket;
        });
    }

    async assertRelatedEntities(data, { requireTeacherAssignment = true } = {}) {
        const academicYear =
            await assessmentRepository.findAcademicYearById(
                data.academicYearId
            );
        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        const term = await assessmentRepository.findTermById(data.termId);
        if (!term) {
            throw new NotFoundError("Term not found.");
        }
        if (term.academicYearId !== data.academicYearId) {
            throw new BadRequestError(
                "Term does not belong to the selected academic year."
            );
        }

        const schoolClass = await assessmentRepository.findSchoolClassById(
            data.classId
        );
        if (!schoolClass) {
            throw new NotFoundError("School class not found.");
        }
        if (schoolClass.academicYearId !== data.academicYearId) {
            throw new BadRequestError(
                "Class does not belong to the selected academic year."
            );
        }

        const subject = await assessmentRepository.findSubjectById(
            data.subjectId
        );
        if (!subject) {
            throw new NotFoundError("Subject not found.");
        }

        const teacher = await assessmentRepository.findTeacherById(
            data.teacherId
        );
        if (!teacher) {
            throw new NotFoundError("Teacher not found.");
        }

        if (
            !isDateWithinRange(
                data.assessmentDate,
                academicYear.startDate,
                academicYear.endDate
            )
        ) {
            throw new BusinessRuleError(
                "Assessment date must fall within the selected academic year."
            );
        }

        if (
            !isDateWithinRange(
                data.assessmentDate,
                term.startDate,
                term.endDate
            )
        ) {
            throw new BusinessRuleError(
                "Assessment date must fall within the selected term."
            );
        }

        const classSubject =
            await assessmentRepository.findActiveClassSubject({
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

        if (requireTeacherAssignment) {
            const teacherSubject =
                await assessmentRepository.findActiveTeacherSubject({
                    teacherId: data.teacherId,
                    subjectId: data.subjectId,
                    academicYearId: data.academicYearId,
                    termId: data.termId,
                });

            if (!teacherSubject) {
                throw new ForbiddenError(
                    "Only teachers assigned to this subject for the selected year/term can record assessment marks."
                );
            }

            if (
                classSubject.teacherSubject &&
                classSubject.teacherSubject.teacherId !== data.teacherId
            ) {
                throw new ForbiddenError(
                    "Selected teacher does not match the teacher assigned on the class subject allocation."
                );
            }
        }

        return { academicYear, term, schoolClass, subject, teacher, classSubject };
    }

    async createAssessment(rawData) {
        const data = sanitizeAssessmentData(rawData);

        if (!data.academicYearId) {
            throw new BadRequestError("Academic year is required.");
        }
        if (!data.termId) throw new BadRequestError("Term is required.");
        if (!data.classId) throw new BadRequestError("Class is required.");
        if (!data.subjectId) throw new BadRequestError("Subject is required.");
        if (!data.teacherId) throw new BadRequestError("Teacher is required.");
        if (!data.assessmentDate) {
            throw new BadRequestError("Assessment date is required.");
        }

        assertValidType(data.assessmentType);
        assertValidStatus(data.status);
        data.maxMarks = assertValidMaxMarks(data.maxMarks);
        data.assessmentDate = toUtcDayStart(data.assessmentDate);
        data.status = data.status || "ACTIVE";

        await this.assertRelatedEntities(data);

        const duplicate = await assessmentRepository.findDuplicate({
            classId: data.classId,
            subjectId: data.subjectId,
            assessmentType: data.assessmentType,
            assessmentDate: data.assessmentDate,
        });

        if (duplicate) {
            throw new ConflictError(
                "An assessment already exists for this class, subject, type, and date."
            );
        }

        if (!data.title) {
            data.title = `${data.assessmentType.replace(/_/g, " ")} · ${formatDateKey(data.assessmentDate)}`;
        }

        return assessmentRepository.createAssessment(data);
    }

    async updateAssessment(id, rawData) {
        const existing = await assessmentRepository.findAssessmentById(id);
        if (!existing) {
            throw new NotFoundError("Assessment not found.");
        }

        const data = sanitizeAssessmentData(rawData);
        if (data.assessmentType) assertValidType(data.assessmentType);
        if (data.status) assertValidStatus(data.status);
        if (data.maxMarks !== undefined) {
            data.maxMarks = assertValidMaxMarks(data.maxMarks);
        }

        const next = {
            title: data.title !== undefined ? data.title : existing.title,
            academicYearId:
                data.academicYearId !== undefined
                    ? data.academicYearId
                    : existing.academicYearId,
            termId: data.termId !== undefined ? data.termId : existing.termId,
            classId:
                data.classId !== undefined ? data.classId : existing.classId,
            subjectId:
                data.subjectId !== undefined
                    ? data.subjectId
                    : existing.subjectId,
            teacherId:
                data.teacherId !== undefined
                    ? data.teacherId
                    : existing.teacherId,
            assessmentType:
                data.assessmentType !== undefined
                    ? data.assessmentType
                    : existing.assessmentType,
            maxMarks:
                data.maxMarks !== undefined
                    ? data.maxMarks
                    : existing.maxMarks,
            assessmentDate:
                data.assessmentDate !== undefined
                    ? toUtcDayStart(data.assessmentDate)
                    : toUtcDayStart(existing.assessmentDate),
            remarks:
                data.remarks !== undefined ? data.remarks : existing.remarks,
            status: data.status !== undefined ? data.status : existing.status,
        };

        await this.assertRelatedEntities(next);

        if (
            Number(next.maxMarks) <
            Math.max(
                ...(existing.scores || []).map((score) => Number(score.marks)),
                0
            )
        ) {
            throw new BusinessRuleError(
                "Maximum marks cannot be lower than an already recorded student score."
            );
        }

        const duplicate = await assessmentRepository.findDuplicate({
            classId: next.classId,
            subjectId: next.subjectId,
            assessmentType: next.assessmentType,
            assessmentDate: next.assessmentDate,
            excludeId: id,
        });

        if (duplicate) {
            throw new ConflictError(
                "An assessment already exists for this class, subject, type, and date."
            );
        }

        return assessmentRepository.updateAssessment(id, next);
    }

    async archiveAssessment(id) {
        const assessment = await assessmentRepository.findAssessmentById(id);
        if (!assessment) {
            throw new NotFoundError("Assessment not found.");
        }
        return assessmentRepository.softDeleteAssessment(id);
    }

    async restoreAssessment(id) {
        const assessment = await assessmentRepository.findAssessmentById(id, {
            includeDeleted: true,
        });
        if (!assessment) {
            throw new NotFoundError("Assessment not found.");
        }
        if (!assessment.deletedAt) {
            throw new BadRequestError("Assessment is not archived.");
        }

        const duplicate = await assessmentRepository.findDuplicate({
            classId: assessment.classId,
            subjectId: assessment.subjectId,
            assessmentType: assessment.assessmentType,
            assessmentDate: toUtcDayStart(assessment.assessmentDate),
            excludeId: id,
        });

        if (duplicate) {
            throw new ConflictError(
                "Cannot restore: an active assessment already exists for this class, subject, type, and date."
            );
        }

        return assessmentRepository.restoreAssessment(id);
    }

    async bulkScores(assessmentId, rawData = {}) {
        const assessment = await this.getAssessmentById(assessmentId);
        const action = String(rawData.action || "UPSERT")
            .trim()
            .toUpperCase();

        if (!["UPSERT", "CLEAR"].includes(action)) {
            throw new BadRequestError(
                "Score action must be UPSERT or CLEAR."
            );
        }

        await this.assertRelatedEntities(
            {
                academicYearId: assessment.academicYearId,
                termId: assessment.termId,
                classId: assessment.classId,
                subjectId: assessment.subjectId,
                teacherId: assessment.teacherId,
                assessmentDate: assessment.assessmentDate,
            },
            { requireTeacherAssignment: true }
        );

        if (action === "CLEAR") {
            const result =
                await assessmentRepository.deleteScoresForAssessment(
                    assessmentId
                );
            return {
                action,
                assessmentId: Number(assessmentId),
                cleared: result.count,
                upserted: 0,
                scores: [],
            };
        }

        const entries = Array.isArray(rawData.entries) ? rawData.entries : [];
        if (!entries.length) {
            throw new BadRequestError(
                "At least one score entry is required."
            );
        }

        const enrollments = await assessmentRepository.findEnrolledStudents({
            academicYearId: assessment.academicYearId,
            schoolClassId: assessment.classId,
            termId: assessment.termId,
        });
        const enrolledIds = new Set(enrollments.map((item) => item.studentId));

        const scores = [];
        for (const entry of entries) {
            const studentId = parseInt(entry.studentId, 10);
            if (!studentId || Number.isNaN(studentId)) {
                throw new BadRequestError(
                    "Each score entry requires a valid studentId."
                );
            }
            if (!enrolledIds.has(studentId)) {
                throw new BusinessRuleError(
                    `Student #${studentId} is not enrolled in this class for the selected year/term.`
                );
            }

            if (entry.marks === null || entry.marks === "") {
                await assessmentRepository.deleteScore(assessmentId, studentId);
                continue;
            }

            const marks = assertValidScore(entry.marks, assessment.maxMarks);
            const remarks =
                entry.remarks === undefined || entry.remarks === null
                    ? null
                    : String(entry.remarks).trim() || null;

            const score = await assessmentRepository.upsertScore({
                assessmentId,
                studentId,
                marks,
                remarks,
            });
            scores.push(score);
        }

        return {
            action,
            assessmentId: Number(assessmentId),
            cleared: 0,
            upserted: scores.length,
            scores,
        };
    }
}

module.exports = new AssessmentService();
