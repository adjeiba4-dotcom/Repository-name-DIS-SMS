// services/academicYear.service.js

const academicYearRepository = require("../repositories/academicYear.repository");
const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");

const ACADEMIC_YEAR_FIELDS = ["name", "startDate", "endDate", "status"];

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

    async createAcademicYear(rawData) {
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

        return academicYearRepository.createAcademicYear(data);
    }

    async updateAcademicYear(id, rawData) {
        const academicYear =
            await academicYearRepository.findAcademicYearById(id);

        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        const data = sanitizeAcademicYearData(rawData);

        if (data.status !== undefined) {
            assertValidStatus(data.status);
        }

        if (data.name && data.name !== academicYear.name) {
            const existing =
                await academicYearRepository.findAcademicYearByName(data.name, {
                    excludeId: id,
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

        return academicYearRepository.updateAcademicYear(id, data);
    }

    async deleteAcademicYear(id) {
        const academicYear =
            await academicYearRepository.findAcademicYearById(id);

        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        const references =
            await academicYearRepository.countReferences(id);

        if (references.total > 0) {
            throw new ConflictError(
                "Cannot archive academic year while it is referenced by related records (terms, enrollments, attendance, examinations, fees, timetables, or hostel allocations)."
            );
        }

        return academicYearRepository.softDeleteAcademicYear(id);
    }

    async restoreAcademicYear(id, { activate = false } = {}) {
        const academicYear =
            await academicYearRepository.findAcademicYearByIdIncludingDeleted(
                id
            );

        if (!academicYear) {
            throw new NotFoundError("Academic year not found.");
        }

        if (!academicYear.deletedAt) {
            throw new BadRequestError("Academic year is already active.");
        }

        const existing = await academicYearRepository.findAcademicYearByName(
            academicYear.name,
            { excludeId: id }
        );
        if (existing && !existing.deletedAt) {
            throw new ConflictError(
                "Cannot restore because another academic year already uses this name."
            );
        }

        return academicYearRepository.restoreAcademicYear(id, { activate });
    }
}

module.exports = new AcademicYearService();
