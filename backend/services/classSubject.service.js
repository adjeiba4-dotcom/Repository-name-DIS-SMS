// services/classSubject.service.js

const classSubjectRepository = require("../repositories/classSubject.repository");
const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");

const ALLOCATION_FIELDS = [
    "schoolClassId",
    "teacherSubjectId",
    "subjectId",
    "academicYearId",
    "termId",
    "weeklyPeriods",
    "isCompulsory",
    "displayOrder",
    "remarks",
    "status",
];

function sanitizeAllocationData(data = {}) {
    const payload = {};

    for (const field of ALLOCATION_FIELDS) {
        if (data[field] === undefined) continue;

        if (
            field === "schoolClassId" ||
            field === "teacherSubjectId" ||
            field === "subjectId" ||
            field === "academicYearId" ||
            field === "termId" ||
            field === "weeklyPeriods" ||
            field === "displayOrder"
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

        if (field === "isCompulsory") {
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

function assertValidDisplayOrder(displayOrder) {
    if (displayOrder === undefined) return;
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
        throw new BadRequestError(
            "Display order must be a non-negative integer."
        );
    }
}

class ClassSubjectService {
    async getClassSubjects(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();
        const schoolClassId = query.schoolClassId
            ? parseInt(query.schoolClassId, 10)
            : null;
        const teacherSubjectId = query.teacherSubjectId
            ? parseInt(query.teacherSubjectId, 10)
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
        const sortBy = (query.sortBy || "displayOrder").trim();
        const sortOrder = (query.sortOrder || "asc").trim().toLowerCase();

        let isCompulsory = null;
        if (query.isCompulsory !== undefined && query.isCompulsory !== "") {
            const raw = String(query.isCompulsory).toLowerCase();
            isCompulsory = raw === "true" || raw === "1";
        }

        if (status) {
            assertValidStatus(status, { allowArchived: false });
        }

        return classSubjectRepository.findClassSubjects({
            page,
            limit,
            search,
            schoolClassId:
                schoolClassId && !Number.isNaN(schoolClassId)
                    ? schoolClassId
                    : null,
            teacherSubjectId:
                teacherSubjectId && !Number.isNaN(teacherSubjectId)
                    ? teacherSubjectId
                    : null,
            subjectId:
                subjectId && !Number.isNaN(subjectId) ? subjectId : null,
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
            termId: termId && !Number.isNaN(termId) ? termId : null,
            isCompulsory,
            status: status || null,
            sortBy,
            sortOrder,
        });
    }

    async getClassSubjectById(id) {
        const allocation =
            await classSubjectRepository.findClassSubjectById(id);

        if (!allocation) {
            throw new NotFoundError("Class subject allocation not found.");
        }

        return allocation;
    }

    async getArchivedClassSubjects() {
        return classSubjectRepository.findArchivedClassSubjects();
    }

    async assertRelatedEntities(data, { teacherSubject = null } = {}) {
        if (data.schoolClassId) {
            const schoolClass =
                await classSubjectRepository.findSchoolClassById(
                    data.schoolClassId
                );
            if (!schoolClass) {
                throw new NotFoundError("Class not found.");
            }
        }

        let resolvedTeacherSubject = teacherSubject;
        if (data.teacherSubjectId && !resolvedTeacherSubject) {
            resolvedTeacherSubject =
                await classSubjectRepository.findTeacherSubjectById(
                    data.teacherSubjectId
                );
            if (!resolvedTeacherSubject) {
                throw new NotFoundError(
                    "Teacher subject assignment not found."
                );
            }
        }

        if (data.academicYearId) {
            const year =
                await classSubjectRepository.findAcademicYearById(
                    data.academicYearId
                );
            if (!year) {
                throw new NotFoundError("Academic year not found.");
            }
        }

        if (
            resolvedTeacherSubject &&
            data.academicYearId &&
            resolvedTeacherSubject.academicYearId !== data.academicYearId
        ) {
            throw new BadRequestError(
                "Teacher subject assignment academic year must match the allocation academic year."
            );
        }

        if (data.termId) {
            const term = await classSubjectRepository.findTermById(
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

        return resolvedTeacherSubject;
    }

    async assertNoDuplicate(data, { excludeId = null } = {}) {
        const existing = await classSubjectRepository.findAllocation({
            schoolClassId: data.schoolClassId,
            subjectId: data.subjectId,
            academicYearId: data.academicYearId,
            termId: data.termId ?? null,
            excludeId,
        });

        if (existing) {
            throw new ConflictError(
                existing.deletedAt
                    ? "An archived allocation for this class, subject, academic year, and term already exists. Restore it instead."
                    : "This subject is already allocated to this class for the selected academic year and term."
            );
        }
    }

    async createClassSubject(rawData) {
        const data = sanitizeAllocationData(rawData);

        if (!data.schoolClassId || !data.teacherSubjectId) {
            throw new BadRequestError(
                "Class and teacher subject assignment are required."
            );
        }

        if (data.weeklyPeriods === undefined) {
            throw new BadRequestError("Weekly periods are required.");
        }

        assertValidWeeklyPeriods(data.weeklyPeriods);
        assertValidDisplayOrder(data.displayOrder);

        if (data.termId === undefined) {
            data.termId = null;
        }

        if (data.isCompulsory === undefined) {
            data.isCompulsory = true;
        }

        if (data.displayOrder === undefined) {
            data.displayOrder = 0;
        }

        data.status = data.status || "ACTIVE";
        assertValidStatus(data.status);

        const teacherSubject =
            await classSubjectRepository.findTeacherSubjectById(
                data.teacherSubjectId
            );
        if (!teacherSubject) {
            throw new NotFoundError("Teacher subject assignment not found.");
        }

        // Subject and teacher are derived from TeacherSubject.
        data.subjectId = teacherSubject.subjectId;

        if (data.academicYearId === undefined) {
            data.academicYearId = teacherSubject.academicYearId;
        }

        await this.assertRelatedEntities(data, { teacherSubject });
        await this.assertNoDuplicate(data);

        return classSubjectRepository.createClassSubject(data);
    }

    async updateClassSubject(id, rawData) {
        const allocation =
            await classSubjectRepository.findClassSubjectById(id);

        if (!allocation) {
            throw new NotFoundError("Class subject allocation not found.");
        }

        const data = sanitizeAllocationData(rawData);

        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        if (data.weeklyPeriods !== undefined) {
            assertValidWeeklyPeriods(data.weeklyPeriods);
        }

        if (data.displayOrder !== undefined) {
            assertValidDisplayOrder(data.displayOrder);
        }

        let teacherSubject = null;
        if (data.teacherSubjectId) {
            teacherSubject =
                await classSubjectRepository.findTeacherSubjectById(
                    data.teacherSubjectId
                );
            if (!teacherSubject) {
                throw new NotFoundError(
                    "Teacher subject assignment not found."
                );
            }
            data.subjectId = teacherSubject.subjectId;
        }

        const next = {
            schoolClassId: data.schoolClassId ?? allocation.schoolClassId,
            subjectId: data.subjectId ?? allocation.subjectId,
            academicYearId: data.academicYearId ?? allocation.academicYearId,
            termId:
                data.termId !== undefined ? data.termId : allocation.termId,
            teacherSubjectId:
                data.teacherSubjectId ?? allocation.teacherSubjectId,
        };

        await this.assertRelatedEntities(
            {
                ...data,
                schoolClassId: next.schoolClassId,
                teacherSubjectId: next.teacherSubjectId,
                academicYearId: next.academicYearId,
                termId: next.termId,
            },
            { teacherSubject }
        );

        const keysChanged =
            next.schoolClassId !== allocation.schoolClassId ||
            next.subjectId !== allocation.subjectId ||
            next.academicYearId !== allocation.academicYearId ||
            (next.termId ?? null) !== (allocation.termId ?? null);

        if (keysChanged) {
            await this.assertNoDuplicate(next, { excludeId: id });
        }

        return classSubjectRepository.updateClassSubject(id, data);
    }

    async deleteClassSubject(id) {
        const allocation =
            await classSubjectRepository.findClassSubjectById(id);

        if (!allocation) {
            throw new NotFoundError("Class subject allocation not found.");
        }

        const references =
            await classSubjectRepository.countReferences(allocation);

        if (references.total > 0) {
            const parts = [];
            if (references.timetables > 0) parts.push("timetable");
            if (references.assessments > 0) parts.push("assessment");
            if (references.examinations > 0) parts.push("examinations");
            if (references.results > 0) parts.push("results");
            throw new ConflictError(
                `Cannot archive allocation while referenced by ${parts.join(", ")}.`
            );
        }

        return classSubjectRepository.softDeleteClassSubject(id);
    }

    async restoreClassSubject(id, { activate = false } = {}) {
        const allocation =
            await classSubjectRepository.findClassSubjectByIdIncludingDeleted(
                id
            );

        if (!allocation) {
            throw new NotFoundError("Class subject allocation not found.");
        }

        if (!allocation.deletedAt) {
            throw new BadRequestError("Allocation is already active.");
        }

        const conflict = await classSubjectRepository.findAllocation({
            schoolClassId: allocation.schoolClassId,
            subjectId: allocation.subjectId,
            academicYearId: allocation.academicYearId,
            termId: allocation.termId,
            excludeId: id,
        });

        if (conflict && !conflict.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another active allocation already exists for this class, subject, academic year, and term."
            );
        }

        return classSubjectRepository.restoreClassSubject(id, {
            status: activate ? "ACTIVE" : "INACTIVE",
        });
    }
}

module.exports = new ClassSubjectService();
