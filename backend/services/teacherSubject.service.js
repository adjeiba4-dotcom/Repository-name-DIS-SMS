// services/teacherSubject.service.js

const teacherSubjectRepository = require("../repositories/teacherSubject.repository");
const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");

const ASSIGNMENT_FIELDS = [
    "teacherId",
    "subjectId",
    "academicYearId",
    "termId",
    "isPrimary",
    "weeklyPeriods",
    "remarks",
    "status",
];

function sanitizeAssignmentData(data = {}) {
    const payload = {};

    for (const field of ASSIGNMENT_FIELDS) {
        if (data[field] === undefined) continue;

        if (
            field === "teacherId" ||
            field === "subjectId" ||
            field === "academicYearId" ||
            field === "termId" ||
            field === "weeklyPeriods"
        ) {
            if (data[field] === null || data[field] === "") {
                if (field === "termId") {
                    payload[field] = null;
                }
                continue;
            }
            payload[field] = parseInt(data[field], 10);
            continue;
        }

        if (field === "isPrimary") {
            if (typeof data[field] === "string") {
                payload[field] =
                    data[field].toLowerCase() === "true" ||
                    data[field] === "1";
            } else {
                payload[field] = Boolean(data[field]);
            }
            continue;
        }

        if (typeof data[field] === "string") {
            const trimmed = data[field].trim();
            if (field === "remarks" && trimmed === "") {
                payload[field] = null;
            } else {
                payload[field] = trimmed;
            }
        } else {
            payload[field] = data[field];
        }
    }

    return payload;
}

function assertValidStatus(status, { allowArchived = false } = {}) {
    const allowed = allowArchived
        ? ["ACTIVE", "INACTIVE", "ARCHIVED"]
        : ["ACTIVE", "INACTIVE"];

    if (status && !allowed.includes(status)) {
        throw new BadRequestError(
            `Status must be one of: ${allowed.join(", ")}.`
        );
    }
}

function assertValidWeeklyPeriods(weeklyPeriods) {
    if (weeklyPeriods === undefined) return;
    if (!Number.isInteger(weeklyPeriods) || weeklyPeriods <= 0) {
        throw new BadRequestError("Weekly periods must be greater than 0.");
    }
}

class TeacherSubjectService {
    async getTeacherSubjects(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();
        const teacherId = query.teacherId
            ? parseInt(query.teacherId, 10)
            : null;
        const subjectId = query.subjectId
            ? parseInt(query.subjectId, 10)
            : null;
        const academicYearId = query.academicYearId
            ? parseInt(query.academicYearId, 10)
            : null;
        const termId = query.termId ? parseInt(query.termId, 10) : null;
        const status = query.status
            ? String(query.status).trim().toUpperCase()
            : null;
        const sortBy = (query.sortBy || "createdAt").trim();
        const sortOrder = (query.sortOrder || "desc").trim().toLowerCase();

        let isPrimary = null;
        if (query.isPrimary !== undefined && query.isPrimary !== "") {
            const raw = String(query.isPrimary).toLowerCase();
            isPrimary = raw === "true" || raw === "1";
        }

        if (status) {
            assertValidStatus(status, { allowArchived: false });
        }

        return teacherSubjectRepository.findTeacherSubjects({
            page,
            limit,
            search,
            teacherId:
                teacherId && !Number.isNaN(teacherId) ? teacherId : null,
            subjectId:
                subjectId && !Number.isNaN(subjectId) ? subjectId : null,
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
            termId: termId && !Number.isNaN(termId) ? termId : null,
            isPrimary,
            status: status || null,
            sortBy,
            sortOrder,
        });
    }

    async getTeacherSubjectById(id) {
        const assignment =
            await teacherSubjectRepository.findTeacherSubjectById(id);

        if (!assignment) {
            throw new NotFoundError("Teacher subject assignment not found.");
        }

        return assignment;
    }

    async getArchivedTeacherSubjects() {
        return teacherSubjectRepository.findArchivedTeacherSubjects();
    }

    async assertRelatedEntities(data) {
        if (data.teacherId) {
            const teacher = await teacherSubjectRepository.findTeacherById(
                data.teacherId
            );
            if (!teacher) {
                throw new NotFoundError("Teacher not found.");
            }
        }

        if (data.subjectId) {
            const subject = await teacherSubjectRepository.findSubjectById(
                data.subjectId
            );
            if (!subject) {
                throw new NotFoundError("Subject not found.");
            }
        }

        if (data.academicYearId) {
            const year =
                await teacherSubjectRepository.findAcademicYearById(
                    data.academicYearId
                );
            if (!year) {
                throw new NotFoundError("Academic year not found.");
            }
        }

        if (data.termId) {
            const term = await teacherSubjectRepository.findTermById(
                data.termId
            );
            if (!term) {
                throw new NotFoundError("Term not found.");
            }
            if (
                data.academicYearId &&
                term.academicYearId !== data.academicYearId
            ) {
                throw new BadRequestError(
                    "Term does not belong to the selected academic year."
                );
            }
        }
    }

    async assertNoDuplicate(data, { excludeId = null } = {}) {
        const existing = await teacherSubjectRepository.findAssignment({
            teacherId: data.teacherId,
            subjectId: data.subjectId,
            academicYearId: data.academicYearId,
            termId: data.termId ?? null,
            excludeId,
        });

        if (existing) {
            throw new ConflictError(
                existing.deletedAt
                    ? "An archived assignment for this teacher, subject, academic year, and term already exists. Restore it instead."
                    : "This teacher is already assigned to this subject for the selected academic year and term."
            );
        }
    }

    async createTeacherSubject(rawData) {
        const data = sanitizeAssignmentData(rawData);

        if (!data.teacherId || !data.subjectId || !data.academicYearId) {
            throw new BadRequestError(
                "Teacher, subject, and academic year are required."
            );
        }

        if (data.weeklyPeriods === undefined) {
            throw new BadRequestError("Weekly periods are required.");
        }

        assertValidWeeklyPeriods(data.weeklyPeriods);

        if (data.termId === undefined) {
            data.termId = null;
        }

        if (data.isPrimary === undefined) {
            data.isPrimary = false;
        }

        data.status = data.status || "ACTIVE";
        assertValidStatus(data.status);

        await this.assertRelatedEntities(data);
        await this.assertNoDuplicate(data);

        return teacherSubjectRepository.createTeacherSubject(data);
    }

    async updateTeacherSubject(id, rawData) {
        const assignment =
            await teacherSubjectRepository.findTeacherSubjectById(id);

        if (!assignment) {
            throw new NotFoundError("Teacher subject assignment not found.");
        }

        const data = sanitizeAssignmentData(rawData);

        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        if (data.weeklyPeriods !== undefined) {
            assertValidWeeklyPeriods(data.weeklyPeriods);
        }

        const next = {
            teacherId: data.teacherId ?? assignment.teacherId,
            subjectId: data.subjectId ?? assignment.subjectId,
            academicYearId: data.academicYearId ?? assignment.academicYearId,
            termId:
                data.termId !== undefined ? data.termId : assignment.termId,
        };

        await this.assertRelatedEntities({
            ...data,
            academicYearId: next.academicYearId,
            termId: next.termId,
        });

        const keysChanged =
            next.teacherId !== assignment.teacherId ||
            next.subjectId !== assignment.subjectId ||
            next.academicYearId !== assignment.academicYearId ||
            (next.termId ?? null) !== (assignment.termId ?? null);

        if (keysChanged) {
            await this.assertNoDuplicate(next, { excludeId: id });
        }

        return teacherSubjectRepository.updateTeacherSubject(id, data);
    }

    async deleteTeacherSubject(id) {
        const assignment =
            await teacherSubjectRepository.findTeacherSubjectById(id);

        if (!assignment) {
            throw new NotFoundError("Teacher subject assignment not found.");
        }

        const references =
            await teacherSubjectRepository.countReferences(assignment);

        if (references.total > 0) {
            const parts = [];
            if (references.timetables > 0) parts.push("timetable");
            if (references.attendance > 0) parts.push("attendance");
            if (references.examinations > 0) parts.push("examinations");
            if (references.results > 0) parts.push("results");
            throw new ConflictError(
                `Cannot archive assignment while referenced by ${parts.join(", ")}.`
            );
        }

        return teacherSubjectRepository.softDeleteTeacherSubject(id);
    }

    async restoreTeacherSubject(id, { activate = false } = {}) {
        const assignment =
            await teacherSubjectRepository.findTeacherSubjectByIdIncludingDeleted(
                id
            );

        if (!assignment) {
            throw new NotFoundError("Teacher subject assignment not found.");
        }

        if (!assignment.deletedAt) {
            throw new BadRequestError("Assignment is already active.");
        }

        const conflict = await teacherSubjectRepository.findAssignment({
            teacherId: assignment.teacherId,
            subjectId: assignment.subjectId,
            academicYearId: assignment.academicYearId,
            termId: assignment.termId,
            excludeId: id,
        });

        if (conflict && !conflict.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another active assignment already exists for this teacher, subject, academic year, and term."
            );
        }

        return teacherSubjectRepository.restoreTeacherSubject(id, {
            status: activate ? "ACTIVE" : "INACTIVE",
        });
    }
}

module.exports = new TeacherSubjectService();
