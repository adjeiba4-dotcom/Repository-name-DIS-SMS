// services/academicYear.service.js

const academicYearRepository = require("../repositories/academicYear.repository");
const auditService = require("./audit.service");
const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");
const { applyDateFields } = require("../utils/date");

const ACADEMIC_YEAR_FIELDS = ["name", "startDate", "endDate", "status"];
const ACADEMIC_YEAR_DATE_FIELDS = ["startDate", "endDate"];

function sanitizeAcademicYearData(data = {}) {
    const payload = {};

    for (const field of ACADEMIC_YEAR_FIELDS) {
        if (data[field] === undefined) continue;
        if (typeof data[field] === "string") {
            payload[field] = data[field].trim();
        } else {
            payload[field] = data[field];
        }
    }

    return applyDateFields(payload, ACADEMIC_YEAR_DATE_FIELDS);
}

function assertDateOrder(startDate, endDate) {
    if (!startDate || !endDate) return;
    if (new Date(startDate) >= new Date(endDate)) {
        throw new BadRequestError("Start date must be earlier than end date.");
    }
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

function toAuditSnapshot(year) {
    if (!year) return null;
    return {
        id: year.id,
        name: year.name,
        startDate: year.startDate ?? null,
        endDate: year.endDate ?? null,
        status: year.status,
        isCurrent: Boolean(year.isCurrent),
        deletedAt: year.deletedAt ?? null,
        createdAt: year.createdAt ?? null,
        updatedAt: year.updatedAt ?? null,
    };
}

async function recordAcademicYearAudit({
    actor = {},
    action,
    academicYear,
    oldAcademicYear = null,
    description,
}) {
    await auditService.recordSafe({
        userId: actor.userId,
        module: "Academic Years",
        action,
        entityType: "AcademicYear",
        recordId: academicYear?.id ?? null,
        description,
        oldValues: toAuditSnapshot(oldAcademicYear),
        newValues: toAuditSnapshot(academicYear),
        ipAddress: actor.ipAddress,
        userAgent: actor.userAgent,
    });
}

class AcademicYearService {
    async getAcademicYears(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();

        return academicYearRepository.findAcademicYears({
            page,
            limit,
            search,
        });
    }

    async getAcademicYearById(id) {
        const academicYear =
            await academicYearRepository.findAcademicYearById(id);

        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        return academicYear;
    }

    async getArchivedAcademicYears() {
        return academicYearRepository.findArchivedAcademicYears();
    }

    async createAcademicYear(rawData, actor = {}) {
        const data = sanitizeAcademicYearData(rawData);

        if (!data.name || !data.startDate || !data.endDate) {
            throw new BadRequestError(
                "Name, start date, and end date are required."
            );
        }

        assertDateOrder(data.startDate, data.endDate);

        data.status = data.status || "ACTIVE";
        assertValidStatus(data.status);

        const existing = await academicYearRepository.findAcademicYearByName(
            data.name
        );
        if (existing) {
            throw new ConflictError(
                existing.deletedAt
                    ? "An archived academic year with this name already exists. Restore it instead."
                    : "Academic year name must be unique."
            );
        }

        const created = await academicYearRepository.createAcademicYear(data);

        await recordAcademicYearAudit({
            actor,
            action: "CREATE",
            academicYear: created,
            description: `Created academic year ${created.name}`,
        });

        return created;
    }

    async updateAcademicYear(id, rawData, actor = {}) {
        const academicYearId = Number(id);
        const academicYear =
            await academicYearRepository.findAcademicYearById(academicYearId);

        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        const data = sanitizeAcademicYearData(rawData);

        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        // Always exclude the current row when validating uniqueness so an
        // unchanged name (or string id from callers) cannot self-conflict.
        if (data.name !== undefined) {
            const existing =
                await academicYearRepository.findAcademicYearByName(data.name, {
                    excludeId: academicYearId,
                });
            if (existing) {
                throw new ConflictError(
                    existing.deletedAt
                        ? "An archived academic year with this name already exists."
                        : "Academic year name must be unique."
                );
            }
        }

        const startDate = data.startDate ?? academicYear.startDate;
        const endDate = data.endDate ?? academicYear.endDate;
        assertDateOrder(startDate, endDate);

        const updated = await academicYearRepository.updateAcademicYear(
            academicYearId,
            data
        );

        await recordAcademicYearAudit({
            actor,
            action: "UPDATE",
            academicYear: updated,
            oldAcademicYear: academicYear,
            description: `Updated academic year ${updated.name}`,
        });

        return updated;
    }

    async deleteAcademicYear(id, actor = {}) {
        const academicYearId = Number(id);
        const academicYear =
            await academicYearRepository.findAcademicYearById(academicYearId);

        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        const references =
            await academicYearRepository.countReferences(academicYearId);

        if (references.total > 0) {
            throw new ConflictError(
                "Cannot archive academic year while it is referenced by related records (terms, enrollments, attendance, examinations, fees, timetables, or hostel allocations)."
            );
        }

        const archived =
            await academicYearRepository.softDeleteAcademicYear(academicYearId);

        await recordAcademicYearAudit({
            actor,
            action: "ARCHIVE",
            academicYear: archived,
            oldAcademicYear: academicYear,
            description: `Archived academic year ${archived.name}`,
        });

        return archived;
    }

    async restoreAcademicYear(id, { activate = false } = {}, actor = {}) {
        const academicYearId = Number(id);
        const academicYear =
            await academicYearRepository.findAcademicYearByIdIncludingDeleted(
                academicYearId
            );

        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        if (!academicYear.deletedAt) {
            throw new BadRequestError("Academic year is already active.");
        }

        const existing = await academicYearRepository.findAcademicYearByName(
            academicYear.name,
            { excludeId: academicYearId }
        );
        if (existing && !existing.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another academic year already uses this name."
            );
        }

        const restored = await academicYearRepository.restoreAcademicYear(
            academicYearId,
            { activate }
        );

        await recordAcademicYearAudit({
            actor,
            action: "RESTORE",
            academicYear: restored,
            oldAcademicYear: academicYear,
            description: `Restored academic year ${restored.name}`,
        });

        return restored;
    }
}

module.exports = new AcademicYearService();
