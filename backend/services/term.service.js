// services/term.service.js

const termRepository = require("../repositories/term.repository");
const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");

const TERM_FIELDS = [
    "academicYearId",
    "code",
    "name",
    "description",
    "startDate",
    "endDate",
    "status",
];

function sanitizeTermData(data = {}) {
    const payload = {};

    for (const field of TERM_FIELDS) {
        if (data[field] === undefined) continue;

        if (field === "academicYearId") {
            payload[field] = parseInt(data[field], 10);
            continue;
        }

        if (typeof data[field] === "string") {
            const trimmed = data[field].trim();
            payload[field] =
                field === "description" && trimmed === "" ? null : trimmed;
        } else {
            payload[field] = data[field];
        }
    }

    return payload;
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

function assertWithinAcademicYear(startDate, endDate, academicYear) {
    if (!academicYear || !startDate || !endDate) return;

    const termStart = new Date(startDate);
    const termEnd = new Date(endDate);
    const yearStart = new Date(academicYear.startDate);
    const yearEnd = new Date(academicYear.endDate);

    if (termStart < yearStart || termEnd > yearEnd) {
        throw new BadRequestError(
            `Term dates must fall within academic year "${academicYear.name}" (${yearStart.toISOString().slice(0, 10)} – ${yearEnd.toISOString().slice(0, 10)}).`
        );
    }
}

class TermService {
    async getTerms(query = {}) {
        const page = Math.max(1, parseInt(query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(query.limit, 10) || 20)
        );
        const search = (query.search || query.keyword || "").trim();
        const academicYearId = query.academicYearId
            ? parseInt(query.academicYearId, 10)
            : null;

        return termRepository.findTerms({
            page,
            limit,
            search,
            academicYearId:
                academicYearId && !Number.isNaN(academicYearId)
                    ? academicYearId
                    : null,
        });
    }

    async getTermById(id) {
        const term = await termRepository.findTermById(id);

        if (!term) {
            throw new NotFoundError("Term not found.");
        }

        return term;
    }

    async getArchivedTerms() {
        return termRepository.findArchivedTerms();
    }

    async createTerm(rawData) {
        const data = sanitizeTermData(rawData);

        if (
            !data.academicYearId ||
            !data.code ||
            !data.name ||
            !data.startDate ||
            !data.endDate
        ) {
            throw new BadRequestError(
                "Academic year, code, name, start date, and end date are required."
            );
        }

        assertDateOrder(data.startDate, data.endDate);

        data.status = data.status || "ACTIVE";
        assertValidStatus(data.status);

        const academicYear = await termRepository.findAcademicYearById(
            data.academicYearId
        );
        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        assertWithinAcademicYear(data.startDate, data.endDate, academicYear);

        const existingName = await termRepository.findTermByName(
            data.academicYearId,
            data.name
        );
        if (existingName) {
            throw new ConflictError(
                existingName.deletedAt
                    ? "An archived term with this name already exists for the selected academic year. Restore it instead."
                    : "A term with this name already exists for the selected academic year."
            );
        }

        const existingCode = await termRepository.findTermByCode(
            data.academicYearId,
            data.code
        );
        if (existingCode) {
            throw new ConflictError(
                existingCode.deletedAt
                    ? "An archived term with this code already exists for the selected academic year. Restore it instead."
                    : "A term with this code already exists for the selected academic year."
            );
        }

        const overlapping = await termRepository.findOverlappingTerm({
            academicYearId: data.academicYearId,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        });
        if (overlapping) {
            throw new ConflictError(
                `Term dates overlap with "${overlapping.name}" (${overlapping.code}).`
            );
        }

        return termRepository.createTerm(data);
    }

    async updateTerm(id, rawData) {
        const term = await termRepository.findTermById(id);

        if (!term) {
            throw new NotFoundError("Term not found.");
        }

        const data = sanitizeTermData(rawData);

        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        const academicYearId = data.academicYearId ?? term.academicYearId;
        const academicYear = await termRepository.findAcademicYearById(
            academicYearId
        );
        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        if (data.name && data.name !== term.name) {
            const existing = await termRepository.findTermByName(
                academicYearId,
                data.name,
                { excludeId: id }
            );
            if (existing) {
                throw new ConflictError(
                    existing.deletedAt
                        ? "An archived term with this name already exists for the selected academic year."
                        : "A term with this name already exists for the selected academic year."
                );
            }
        }

        if (data.code && data.code !== term.code) {
            const existing = await termRepository.findTermByCode(
                academicYearId,
                data.code,
                { excludeId: id }
            );
            if (existing) {
                throw new ConflictError(
                    existing.deletedAt
                        ? "An archived term with this code already exists for the selected academic year."
                        : "A term with this code already exists for the selected academic year."
                );
            }
        }

        const startDate = data.startDate ?? term.startDate;
        const endDate = data.endDate ?? term.endDate;
        assertDateOrder(startDate, endDate);
        assertWithinAcademicYear(startDate, endDate, academicYear);

        const overlapping = await termRepository.findOverlappingTerm({
            academicYearId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            excludeId: id,
        });
        if (overlapping) {
            throw new ConflictError(
                `Term dates overlap with "${overlapping.name}" (${overlapping.code}).`
            );
        }

        return termRepository.updateTerm(id, data);
    }

    async activateTerm(id) {
        const term = await termRepository.findTermById(id);

        if (!term) {
            throw new NotFoundError("Term not found.");
        }

        if (term.status === "ACTIVE" && term.isCurrent) {
            throw new BadRequestError("Term is already active.");
        }

        return termRepository.activateTerm(id);
    }

    async deleteTerm(id) {
        const term = await termRepository.findTermById(id);

        if (!term) {
            throw new NotFoundError("Term not found.");
        }

        const references = await termRepository.countReferences(id);

        if (references.total > 0) {
            throw new ConflictError(
                "Cannot archive term while it is referenced by related records (attendance, examinations, results, or timetables)."
            );
        }

        return termRepository.softDeleteTerm(id);
    }

    async restoreTerm(id, { activate = false } = {}) {
        const term = await termRepository.findTermByIdIncludingDeleted(id);

        if (!term) {
            throw new NotFoundError("Term not found.");
        }

        if (!term.deletedAt) {
            throw new BadRequestError("Term is already active.");
        }

        const existingName = await termRepository.findTermByName(
            term.academicYearId,
            term.name,
            { excludeId: id }
        );
        if (existingName && !existingName.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another term already uses this name for the academic year."
            );
        }

        const existingCode = await termRepository.findTermByCode(
            term.academicYearId,
            term.code,
            { excludeId: id }
        );
        if (existingCode && !existingCode.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another term already uses this code for the academic year."
            );
        }

        const overlapping = await termRepository.findOverlappingTerm({
            academicYearId: term.academicYearId,
            startDate: new Date(term.startDate),
            endDate: new Date(term.endDate),
            excludeId: id,
        });
        if (overlapping) {
            throw new ConflictError(
                `Cannot restore because dates overlap with "${overlapping.name}" (${overlapping.code}).`
            );
        }

        return termRepository.restoreTerm(id, { activate });
    }
}

module.exports = new TermService();
