// repositories/academicYear.repository.js

const prisma = require("../database/db");

/** Slim fields for list / search / archive directory. */
const academicYearListSelect = {
    id: true,
    name: true,
    startDate: true,
    endDate: true,
    isCurrent: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    _count: {
        select: {
            terms: true,
            enrollments: true,
            attendance: true,
            examinations: true,
            feeStructures: true,
            timetables: true,
            bedAllocations: true,
        },
    },
};

/** Full detail for profile / edit. */
const academicYearDetailSelect = {
    ...academicYearListSelect,
    terms: {
        where: { deletedAt: null },
        select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
            status: true,
        },
        orderBy: { startDate: "asc" },
    },
};

class AcademicYearRepository {
    async findAcademicYears({ page = 1, limit = 20, search = "" } = {}) {
        const where = {
            deletedAt: null,
        };

        if (search) {
            where.name = { contains: search };
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.academicYear.findMany({
                where,
                select: academicYearListSelect,
                orderBy: [{ startDate: "desc" }, { name: "asc" }],
                skip,
                take: limit,
            }),
            prisma.academicYear.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 0,
        };
    }

    async findAcademicYearById(id) {
        return prisma.academicYear.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: academicYearDetailSelect,
        });
    }

    async findAcademicYearByIdIncludingDeleted(id) {
        return prisma.academicYear.findFirst({
            where: { id },
            select: academicYearDetailSelect,
        });
    }

    async findAcademicYearByName(name, { excludeId = null } = {}) {
        if (!name) return null;

        return prisma.academicYear.findFirst({
            where: {
                name,
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: {
                id: true,
                name: true,
                deletedAt: true,
                status: true,
            },
        });
    }

    async findActiveAcademicYear({ excludeId = null } = {}) {
        return prisma.academicYear.findFirst({
            where: {
                deletedAt: null,
                status: "ACTIVE",
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            select: academicYearListSelect,
        });
    }

    async countReferences(id) {
        const [terms, enrollments, attendance, examinations, feeStructures, timetables, bedAllocations] =
            await Promise.all([
                prisma.term.count({ where: { academicYearId: id } }),
                prisma.enrollment.count({ where: { academicYearId: id } }),
                prisma.attendance.count({ where: { academicYearId: id } }),
                prisma.examination.count({ where: { academicYearId: id } }),
                prisma.feeStructure.count({ where: { academicYearId: id } }),
                prisma.timetable.count({ where: { academicYearId: id } }),
                prisma.bedAllocation.count({ where: { academicYearId: id } }),
            ]);

        const total =
            terms +
            enrollments +
            attendance +
            examinations +
            feeStructures +
            timetables +
            bedAllocations;

        return {
            total,
            terms,
            enrollments,
            attendance,
            examinations,
            feeStructures,
            timetables,
            bedAllocations,
        };
    }

    async createAcademicYear(data) {
        return prisma.$transaction(async (tx) => {
            if (data.status === "ACTIVE") {
                await tx.academicYear.updateMany({
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

            return tx.academicYear.create({
                data: {
                    ...data,
                    isCurrent: data.status === "ACTIVE",
                },
                select: academicYearDetailSelect,
            });
        });
    }

    async updateAcademicYear(id, data) {
        return prisma.$transaction(async (tx) => {
            if (data.status === "ACTIVE") {
                await tx.academicYear.updateMany({
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

            return tx.academicYear.update({
                where: { id },
                data: payload,
                select: academicYearDetailSelect,
            });
        });
    }

    async softDeleteAcademicYear(id) {
        return prisma.academicYear.update({
            where: { id },
            data: {
                status: "ARCHIVED",
                isCurrent: false,
                deletedAt: new Date(),
            },
            select: academicYearDetailSelect,
        });
    }

    async restoreAcademicYear(id, { activate = false } = {}) {
        return prisma.$transaction(async (tx) => {
            if (activate) {
                await tx.academicYear.updateMany({
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

            return tx.academicYear.update({
                where: { id },
                data: {
                    status: activate ? "ACTIVE" : "INACTIVE",
                    isCurrent: Boolean(activate),
                    deletedAt: null,
                },
                select: academicYearDetailSelect,
            });
        });
    }

    async findArchivedAcademicYears() {
        return prisma.academicYear.findMany({
            where: {
                deletedAt: { not: null },
            },
            select: academicYearListSelect,
            orderBy: [{ startDate: "desc" }, { name: "asc" }],
        });
    }
}

module.exports = new AcademicYearRepository();
