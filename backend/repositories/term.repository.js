// repositories/term.repository.js

const prisma = require("../database/db");

/** Slim fields for list / search / archive directory. */
const termListSelect = {
    id: true,
    academicYearId: true,
    code: true,
    name: true,
    description: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    academicYear: {
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true,
            isCurrent: true,
        },
    },
    _count: {
        select: {
            attendance: true,
            examinations: true,
            results: true,
            timetables: true,
        },
    },
};

/** Full detail for profile / edit. */
const termDetailSelect = {
    ...termListSelect,
};

class TermRepository {
    async findTerms({
        page = 1,
        limit = 20,
        search = "",
        academicYearId = null,
    } = {}) {
        const where = {
            deletedAt: null,
        };

        if (academicYearId) {
            where.academicYearId = academicYearId;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { code: { contains: search } },
                { description: { contains: search } },
                { academicYear: { name: { contains: search } } },
            ];
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.term.findMany({
                where,
                select: termListSelect,
                orderBy: [
                    { academicYear: { startDate: "desc" } },
                    { startDate: "asc" },
                    { name: "asc" },
                ],
                skip,
                take: limit,
            }),
            prisma.term.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findTermById(id) {
        const termId = Number(id);
        if (!Number.isInteger(termId) || termId < 1) {
            return null;
        }

        return prisma.term.findFirst({
            where: {
                id: termId,
                deletedAt: null,
            },
            select: termDetailSelect,
        });
    }

    async findTermByIdIncludingDeleted(id) {
        const termId = Number(id);
        if (!Number.isInteger(termId) || termId < 1) {
            return null;
        }

        return prisma.term.findFirst({
            where: { id: termId },
            select: termDetailSelect,
        });
    }

    async findTermByName(academicYearId, name, { excludeId = null } = {}) {
        if (!name) return null;

        const where = {
            academicYearId: Number(academicYearId),
            name,
        };

        if (excludeId != null && excludeId !== "") {
            const excluded = Number(excludeId);
            if (Number.isInteger(excluded) && excluded > 0) {
                where.id = { not: excluded };
            }
        }

        return prisma.term.findFirst({
            where,
            select: {
                id: true,
                name: true,
                code: true,
                deletedAt: true,
                status: true,
            },
        });
    }

    async findTermByCode(academicYearId, code, { excludeId = null } = {}) {
        if (!code) return null;

        const where = {
            academicYearId: Number(academicYearId),
            code,
        };

        if (excludeId != null && excludeId !== "") {
            const excluded = Number(excludeId);
            if (Number.isInteger(excluded) && excluded > 0) {
                where.id = { not: excluded };
            }
        }

        return prisma.term.findFirst({
            where,
            select: {
                id: true,
                name: true,
                code: true,
                deletedAt: true,
                status: true,
            },
        });
    }

    async findActiveTerm({ excludeId = null } = {}) {
        const where = {
            deletedAt: null,
            status: "ACTIVE",
        };

        if (excludeId != null && excludeId !== "") {
            const excluded = Number(excludeId);
            if (Number.isInteger(excluded) && excluded > 0) {
                where.id = { not: excluded };
            }
        }

        return prisma.term.findFirst({
            where,
            select: termListSelect,
        });
    }

    async findOverlappingTerm({
        academicYearId,
        startDate,
        endDate,
        excludeId = null,
    }) {
        const where = {
            academicYearId: Number(academicYearId),
            deletedAt: null,
            startDate: { lte: endDate },
            endDate: { gte: startDate },
        };

        if (excludeId != null && excludeId !== "") {
            const excluded = Number(excludeId);
            if (Number.isInteger(excluded) && excluded > 0) {
                where.id = { not: excluded };
            }
        }

        return prisma.term.findFirst({
            where,
            select: {
                id: true,
                name: true,
                code: true,
                startDate: true,
                endDate: true,
            },
        });
    }

    async findAcademicYearById(id) {
        const academicYearId = Number(id);
        if (!Number.isInteger(academicYearId) || academicYearId < 1) {
            return null;
        }

        return prisma.academicYear.findFirst({
            where: {
                id: academicYearId,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                status: true,
                isCurrent: true,
                deletedAt: true,
            },
        });
    }

    async countReferences(id) {
        const termId = Number(id);
        const [attendance, examinations, results, timetables] =
            await Promise.all([
                prisma.attendance.count({ where: { termId } }),
                prisma.examination.count({ where: { termId } }),
                prisma.result.count({ where: { termId } }),
                prisma.timetable.count({ where: { termId } }),
            ]);

        const total = attendance + examinations + results + timetables;

        return {
            total,
            attendance,
            examinations,
            results,
            timetables,
        };
    }

    async createTerm(data) {
        return prisma.$transaction(async (tx) => {
            if (data.status === "ACTIVE") {
                await tx.term.updateMany({
                    where: {
                        deletedAt: null,
                        status: "ACTIVE",
                    },
                    data: {
                        status: "INACTIVE",
                        isCurrent: false,
                    },
                });
            }

            return tx.term.create({
                data: {
                    ...data,
                    isCurrent: data.status === "ACTIVE",
                },
                select: termDetailSelect,
            });
        });
    }

    async updateTerm(id, data) {
        const termId = Number(id);

        return prisma.$transaction(async (tx) => {
            if (data.status === "ACTIVE") {
                await tx.term.updateMany({
                    where: {
                        deletedAt: null,
                        status: "ACTIVE",
                        id: { not: termId },
                    },
                    data: {
                        status: "INACTIVE",
                        isCurrent: false,
                    },
                });
            }

            const payload = { ...data };
            if (data.status !== undefined) {
                payload.isCurrent = data.status === "ACTIVE";
            }

            return tx.term.update({
                where: { id: termId },
                data: payload,
                select: termDetailSelect,
            });
        });
    }

    async activateTerm(id) {
        const termId = Number(id);

        return prisma.$transaction(async (tx) => {
            await tx.term.updateMany({
                where: {
                    deletedAt: null,
                    status: "ACTIVE",
                    id: { not: termId },
                },
                data: {
                    status: "INACTIVE",
                    isCurrent: false,
                },
            });

            return tx.term.update({
                where: { id: termId },
                data: {
                    status: "ACTIVE",
                    isCurrent: true,
                    deletedAt: null,
                },
                select: termDetailSelect,
            });
        });
    }

    async softDeleteTerm(id) {
        return prisma.term.update({
            where: { id: Number(id) },
            data: {
                status: "ARCHIVED",
                isCurrent: false,
                deletedAt: new Date(),
            },
            select: termDetailSelect,
        });
    }

    async restoreTerm(id, { activate = false } = {}) {
        const termId = Number(id);

        return prisma.$transaction(async (tx) => {
            if (activate) {
                await tx.term.updateMany({
                    where: {
                        deletedAt: null,
                        status: "ACTIVE",
                    },
                    data: {
                        status: "INACTIVE",
                        isCurrent: false,
                    },
                });
            }

            return tx.term.update({
                where: { id: termId },
                data: {
                    status: activate ? "ACTIVE" : "INACTIVE",
                    isCurrent: Boolean(activate),
                    deletedAt: null,
                },
                select: termDetailSelect,
            });
        });
    }

    async findArchivedTerms() {
        return prisma.term.findMany({
            where: {
                deletedAt: { not: null },
            },
            select: termListSelect,
            orderBy: [{ deletedAt: "desc" }, { name: "asc" }],
        });
    }
}

module.exports = new TermRepository();
