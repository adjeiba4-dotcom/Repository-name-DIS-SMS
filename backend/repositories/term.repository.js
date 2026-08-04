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
        return prisma.term.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: termDetailSelect,
        });
    }

    async findTermByIdIncludingDeleted(id) {
        return prisma.term.findFirst({
            where: { id },
            select: termDetailSelect,
        });
    }

    async findTermByName(academicYearId, name, { excludeId = null } = {}) {
        if (!name) return null;

        return prisma.term.findFirst({
            where: {
                academicYearId,
                name,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
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

        return prisma.term.findFirst({
            where: {
                academicYearId,
                code,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
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
        return prisma.term.findFirst({
            where: {
                deletedAt: null,
                status: "ACTIVE",
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: termListSelect,
        });
    }

    async findOverlappingTerm({
        academicYearId,
        startDate,
        endDate,
        excludeId = null,
    }) {
        return prisma.term.findFirst({
            where: {
                academicYearId,
                deletedAt: null,
                ...(excludeId ? { id: { not: excludeId } } : {}),
                startDate: { lte: endDate },
                endDate: { gte: startDate },
            },
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
        return prisma.academicYear.findFirst({
            where: {
                id,
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
        const [attendance, examinations, results, timetables] =
            await Promise.all([
                prisma.attendance.count({ where: { termId: id } }),
                prisma.examination.count({ where: { termId: id } }),
                prisma.result.count({ where: { termId: id } }),
                prisma.timetable.count({ where: { termId: id } }),
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
        return prisma.$transaction(async (tx) => {
            if (data.status === "ACTIVE") {
                await tx.term.updateMany({
                    where: {
                        deletedAt: null,
                        status: "ACTIVE",
                        id: { not: id },
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
                where: { id },
                data: payload,
                select: termDetailSelect,
            });
        });
    }

    async activateTerm(id) {
        return prisma.$transaction(async (tx) => {
            await tx.term.updateMany({
                where: {
                    deletedAt: null,
                    status: "ACTIVE",
                    id: { not: id },
                },
                data: {
                    status: "INACTIVE",
                    isCurrent: false,
                },
            });

            return tx.term.update({
                where: { id },
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
            where: { id },
            data: {
                status: "ARCHIVED",
                isCurrent: false,
                deletedAt: new Date(),
            },
            select: termDetailSelect,
        });
    }

    async restoreTerm(id, { activate = false } = {}) {
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
                where: { id },
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
