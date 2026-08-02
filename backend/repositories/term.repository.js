// repositories/term.repository.js

const prisma = require("../database/db");

class TermRepository {
    async findAllTerms() {
        return prisma.term.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                academicYear: true,
            },
            orderBy: [{
                    academicYear: {
                        startDate: "desc",
                    },
                },
                {
                    startDate: "asc",
                },
            ],
        });
    }

    async findTermById(id) {
        return prisma.term.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                academicYear: true,
            },
        });
    }

    async findTermByName(academicYearId, name) {
        return prisma.term.findFirst({
            where: {
                academicYearId,
                name,
                deletedAt: null,
            },
        });
    }

    async findCurrentTerm() {
        return prisma.term.findFirst({
            where: {
                isCurrent: true,
                deletedAt: null,
            },
            include: {
                academicYear: true,
            },
        });
    }

    async searchTerms(search) {
        return prisma.term.findMany({
            where: {
                deletedAt: null,
                OR: [{
                        name: {
                            contains: search,
                        },
                    },
                    {
                        academicYear: {
                            name: {
                                contains: search,
                            },
                        },
                    },
                ],
            },
            include: {
                academicYear: true,
            },
            orderBy: {
                startDate: "asc",
            },
        });
    }

    async createTerm(data) {
        return prisma.term.create({
            data,
            include: {
                academicYear: true,
            },
        });
    }

    async updateTerm(id, data) {
        return prisma.term.update({
            where: {
                id,
            },
            data,
            include: {
                academicYear: true,
            },
        });
    }

    async clearCurrentTerm() {
        return prisma.term.updateMany({
            where: {
                isCurrent: true,
                deletedAt: null,
            },
            data: {
                isCurrent: false,
            },
        });
    }

    async softDeleteTerm(id) {
        return prisma.term.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
                isCurrent: false,
            },
        });
    }

    async restoreTerm(id) {
        return prisma.term.update({
            where: {
                id,
            },
            data: {
                deletedAt: null,
            },
        });
    }

    async findArchivedTerms() {
        return prisma.term.findMany({
            where: {
                deletedAt: {
                    not: null,
                },
            },
            include: {
                academicYear: true,
            },
            orderBy: {
                deletedAt: "desc",
            },
        });
    }

    async findAcademicYearById(id) {
        return prisma.academicYear.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }
}

module.exports = new TermRepository();