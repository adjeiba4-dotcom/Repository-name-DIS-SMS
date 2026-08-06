// services/subject.service.js

const subjectRepository = require("../repositories/subject.repository");
const auditService = require("./audit.service");
const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");

const SUBJECT_FIELDS = [
    "subjectCode",
    "subjectName",
    "shortName",
    "departmentId",
    "schoolClassId",
    "category",
    "creditHours",
    "description",
    "status",
];

const CATEGORY_VALUES = ["CORE", "ELECTIVE"];

function sanitizeSubjectData(data = {}) {
    const payload = {};

    for (const field of SUBJECT_FIELDS) {
        if (data[field] === undefined) continue;

        if (
            field === "departmentId" ||
            field === "schoolClassId" ||
            field === "creditHours"
        ) {
            if (data[field] === null || data[field] === "") {
                if (field === "departmentId" || field === "schoolClassId") {
                    payload[field] = null;
                }
                continue;
            }
            payload[field] = parseInt(data[field], 10);
            continue;
        }

        if (typeof data[field] === "string") {
            const trimmed = data[field].trim();
            if (field === "category") {
                payload[field] = trimmed.toUpperCase();
            } else if (field === "description" && trimmed === "") {
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

function assertValidCategory(category) {
    if (category && !CATEGORY_VALUES.includes(category)) {
        throw new BadRequestError(
            `Category must be one of: ${CATEGORY_VALUES.join(", ")}.`
        );
    }
}

function assertValidCreditHours(creditHours) {
    if (creditHours === undefined) return;
    if (!Number.isInteger(creditHours) || creditHours <= 0) {
        throw new BadRequestError("Credit hours must be greater than 0.");
    }
}

function toAuditSnapshot(subject) {
    if (!subject) return null;
    return {
        id: subject.id,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        shortName: subject.shortName,
        departmentId: subject.departmentId ?? null,
        schoolClassId: subject.schoolClassId ?? null,
        category: subject.category,
        creditHours: subject.creditHours,
        description: subject.description ?? null,
        status: subject.status,
        deletedAt: subject.deletedAt ?? null,
        createdAt: subject.createdAt ?? null,
        updatedAt: subject.updatedAt ?? null,
    };
}

async function recordSubjectAudit({
    actor = {},
    action,
    subject,
    oldSubject = null,
    description,
}) {
    await auditService.recordSafe({
        userId: actor.userId,
        module: "Subjects",
        action,
        entityType: "Subject",
        recordId: subject?.id ?? null,
        description,
        oldValues: toAuditSnapshot(oldSubject),
        newValues: toAuditSnapshot(subject),
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
    });
}

function buildArchiveBlockMessage(references) {
    const parts = [];
    if (references.teacherAssignments > 0) {
        parts.push("teacher assignments");
    }
    if (references.classAssignments > 0) {
        parts.push("class assignments");
    }
    if (references.assessments > 0) {
        parts.push("assessments");
    }
    if (references.examinations > 0) {
        parts.push("examinations");
    }
    if (references.results > 0) {
        parts.push("results");
    }
    if (references.timetables > 0 || references.timetableEntries > 0) {
        parts.push("timetables");
    }
    return `Cannot archive subject while referenced by ${parts.join(", ")}.`;
}

class SubjectService {
    async getSubjects(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();
        const departmentId = query.departmentId
            ? parseInt(query.departmentId, 10)
            : null;
        const schoolClassId = query.schoolClassId
            ? parseInt(query.schoolClassId, 10)
            : null;
        const category = query.category
            ? String(query.category).trim().toUpperCase()
            : null;
        const status = query.status
            ? String(query.status).trim().toUpperCase()
            : null;
        const sortBy = (query.sortBy || "subjectName").trim();
        const sortOrder = (query.sortOrder || "asc").trim().toLowerCase();

        if (status) {
            assertValidStatus(status, { allowArchived: false });
        }

        if (category) {
            assertValidCategory(category);
        }

        return subjectRepository.findSubjects({
            page,
            limit,
            search,
            departmentId:
                departmentId && !Number.isNaN(departmentId)
                    ? departmentId
                    : null,
            schoolClassId:
                schoolClassId && !Number.isNaN(schoolClassId)
                    ? schoolClassId
                    : null,
            category: category || null,
            status: status || null,
            sortBy,
            sortOrder,
        });
    }

    async getSubjectById(id) {
        const subject = await subjectRepository.findSubjectById(id);

        if (!subject) {
            throw new NotFoundError("Subject not found.");
        }

        return subject;
    }

    async getArchivedSubjects() {
        return subjectRepository.findArchivedSubjects();
    }

    async createSubject(rawData, actor = {}) {
        const data = sanitizeSubjectData(rawData);

        if (!data.subjectCode || !data.subjectName || !data.shortName) {
            throw new BadRequestError(
                "Subject code, subject name, and short name are required."
            );
        }

        if (data.creditHours === undefined) {
            throw new BadRequestError("Credit hours are required.");
        }

        assertValidCreditHours(data.creditHours);

        data.category = data.category || "CORE";
        assertValidCategory(data.category);

        data.status = data.status || "ACTIVE";
        assertValidStatus(data.status);

        if (data.departmentId) {
            const department = await subjectRepository.findDepartmentById(
                data.departmentId
            );
            if (!department) {
                throw new NotFoundError("Department not found.");
            }
        }

        if (data.schoolClassId) {
            const schoolClass = await subjectRepository.findSchoolClassById(
                data.schoolClassId
            );
            if (!schoolClass) {
                throw new NotFoundError("Class not found.");
            }
        }

        const existingCode = await subjectRepository.findSubjectByCode(
            data.subjectCode
        );
        if (existingCode) {
            throw new ConflictError(
                existingCode.deletedAt
                    ? "An archived subject with this code already exists. Restore it instead."
                    : "A subject with this code already exists."
            );
        }

        const existingName = await subjectRepository.findSubjectByName(
            data.subjectName
        );
        if (existingName) {
            throw new ConflictError(
                existingName.deletedAt
                    ? "An archived subject with this name already exists. Restore it instead."
                    : "A subject with this name already exists."
            );
        }

        const created = await subjectRepository.createSubject(data);

        await recordSubjectAudit({
            actor,
            action: "CREATE",
            subject: created,
            description: `Created subject ${created.subjectCode} — ${created.subjectName}`,
        });

        return created;
    }

    async updateSubject(id, rawData, actor = {}) {
        const subjectId = Number(id);
        const subject = await subjectRepository.findSubjectById(subjectId);

        if (!subject) {
            throw new NotFoundError("Subject not found.");
        }

        const data = sanitizeSubjectData(rawData);

        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        if (data.category !== undefined) {
            assertValidCategory(data.category);
        }

        if (data.creditHours !== undefined) {
            assertValidCreditHours(data.creditHours);
        }

        if (data.departmentId) {
            const department = await subjectRepository.findDepartmentById(
                data.departmentId
            );
            if (!department) {
                throw new NotFoundError("Department not found.");
            }
        }

        if (data.schoolClassId) {
            const schoolClass = await subjectRepository.findSchoolClassById(
                data.schoolClassId
            );
            if (!schoolClass) {
                throw new NotFoundError("Class not found.");
            }
        }

        if (data.subjectCode && data.subjectCode !== subject.subjectCode) {
            const existing = await subjectRepository.findSubjectByCode(
                data.subjectCode,
                { excludeId: subjectId }
            );
            if (existing) {
                throw new ConflictError(
                    existing.deletedAt
                        ? "An archived subject with this code already exists."
                        : "A subject with this code already exists."
                );
            }
        }

        if (data.subjectName && data.subjectName !== subject.subjectName) {
            const existing = await subjectRepository.findSubjectByName(
                data.subjectName,
                { excludeId: subjectId }
            );
            if (existing) {
                throw new ConflictError(
                    existing.deletedAt
                        ? "An archived subject with this name already exists."
                        : "A subject with this name already exists."
                );
            }
        }

        const updated = await subjectRepository.updateSubject(subjectId, data);

        await recordSubjectAudit({
            actor,
            action: "UPDATE",
            subject: updated,
            oldSubject: subject,
            description: `Updated subject ${updated.subjectCode} — ${updated.subjectName}`,
        });

        return updated;
    }

    async deleteSubject(id, actor = {}) {
        const subjectId = Number(id);
        const subject = await subjectRepository.findSubjectById(subjectId);

        if (!subject) {
            throw new NotFoundError("Subject not found.");
        }

        const references = await subjectRepository.countReferences(subjectId);

        if (references.total > 0) {
            throw new ConflictError(buildArchiveBlockMessage(references));
        }

        const archived = await subjectRepository.softDeleteSubject(subjectId);

        await recordSubjectAudit({
            actor,
            action: "ARCHIVE",
            subject: archived,
            oldSubject: subject,
            description: `Archived subject ${archived.subjectCode} — ${archived.subjectName}`,
        });

        return archived;
    }

    async restoreSubject(id, { activate = false } = {}, actor = {}) {
        const subjectId = Number(id);
        const subject =
            await subjectRepository.findSubjectByIdIncludingDeleted(subjectId);

        if (!subject) {
            throw new NotFoundError("Subject not found.");
        }

        if (!subject.deletedAt) {
            throw new BadRequestError("Subject is already active.");
        }

        const existingCode = await subjectRepository.findSubjectByCode(
            subject.subjectCode,
            { excludeId: subjectId }
        );
        if (existingCode && !existingCode.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another subject already uses this code."
            );
        }

        const existingName = await subjectRepository.findSubjectByName(
            subject.subjectName,
            { excludeId: subjectId }
        );
        if (existingName && !existingName.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another subject already uses this name."
            );
        }

        const restored = await subjectRepository.restoreSubject(subjectId, {
            status: activate ? "ACTIVE" : "INACTIVE",
        });

        await recordSubjectAudit({
            actor,
            action: "RESTORE",
            subject: restored,
            oldSubject: subject,
            description: `Restored subject ${restored.subjectCode} — ${restored.subjectName}`,
        });

        return restored;
    }
}

module.exports = new SubjectService();
