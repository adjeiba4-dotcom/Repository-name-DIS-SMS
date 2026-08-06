// repositories/grade.repository.js

const prisma = require("../database/db");

const toDecimalNumber = (value) =>
    value == null ? null : Number(value);

const gradeSelect = {
    id: true,
    gradeScaleId: true,
    grade: true,
    description: true,
    minimumScore: true,
    maximumScore: true,
    gradePoint: true,
    remarks: true,
    isPass: true,
    sortOrder: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    gradeScale: {
        select: {
            id: true,
            name: true,
            isDefault: true,
            status: true,
        },
    },
};

const gradeScaleSelect = {
    id: true,
    name: true,
    description: true,
    isDefault: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    grades: {
        where: { status: { not: "ARCHIVED" } },
        orderBy: [{ sortOrder: "asc" }, { minimumScore: "desc" }],
        select: gradeSelect,
    },
    _count: {
        select: {
            grades: true,
        },
    },
};

function mapGrade(row) {
    if (!row) return null;
    return {
        ...row,
        minimumScore: toDecimalNumber(row.minimumScore),
        maximumScore: toDecimalNumber(row.maximumScore),
        gradePoint: toDecimalNumber(row.gradePoint),
    };
}

function mapScale(row) {
    if (!row) return null;
    return {
        ...row,
        grades: (row.grades || []).map(mapGrade),
    };
}

class GradeRepository {
    async findScales({ status = null, search = "" } = {}) {
        const where = {};
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }

        const rows = await prisma.gradeScale.findMany({
            where,
            orderBy: [{ isDefault: "desc" }, { name: "asc" }],
            select: gradeScaleSelect,
        });
        return rows.map(mapScale);
    }

    async findScaleById(id) {
        const row = await prisma.gradeScale.findUnique({
            where: { id: Number(id) },
            select: gradeScaleSelect,
        });
        return mapScale(row);
    }

    async findScaleByName(name, excludeId = null) {
        const row = await prisma.gradeScale.findFirst({
            where: {
                name,
                ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
            },
            select: { id: true, name: true },
        });
        return row;
    }

    async createScale(data) {
        if (data.isDefault) {
            await prisma.gradeScale.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        const created = await prisma.gradeScale.create({
            data: {
                name: data.name,
                description: data.description || null,
                isDefault: Boolean(data.isDefault),
                status: data.status || "ACTIVE",
            },
            select: gradeScaleSelect,
        });
        return mapScale(created);
    }

    async updateScale(id, data) {
        if (data.isDefault === true) {
            await prisma.gradeScale.updateMany({
                where: { isDefault: true, id: { not: Number(id) } },
                data: { isDefault: false },
            });
        }

        const updated = await prisma.gradeScale.update({
            where: { id: Number(id) },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.description !== undefined
                    ? { description: data.description }
                    : {}),
                ...(data.isDefault !== undefined
                    ? { isDefault: Boolean(data.isDefault) }
                    : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
            },
            select: gradeScaleSelect,
        });
        return mapScale(updated);
    }

    async setDefaultScale(id) {
        await prisma.$transaction([
            prisma.gradeScale.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            }),
            prisma.gradeScale.update({
                where: { id: Number(id) },
                data: { isDefault: true, status: "ACTIVE" },
            }),
        ]);
        return this.findScaleById(id);
    }

    async findGrades({ gradeScaleId = null, status = null } = {}) {
        const where = {};
        if (gradeScaleId) where.gradeScaleId = Number(gradeScaleId);
        if (status) where.status = status;

        const rows = await prisma.grade.findMany({
            where,
            orderBy: [{ sortOrder: "asc" }, { minimumScore: "desc" }],
            select: gradeSelect,
        });
        return rows.map(mapGrade);
    }

    async findGradeById(id) {
        const row = await prisma.grade.findUnique({
            where: { id: Number(id) },
            select: gradeSelect,
        });
        return mapGrade(row);
    }

    async findGradeByLetter(grade, excludeId = null) {
        return prisma.grade.findFirst({
            where: {
                grade,
                ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
            },
            select: { id: true, grade: true },
        });
    }

    async createGrade(data) {
        const created = await prisma.grade.create({
            data: {
                gradeScaleId: data.gradeScaleId || null,
                grade: data.grade,
                description: data.description || null,
                minimumScore: data.minimumScore,
                maximumScore: data.maximumScore,
                gradePoint: data.gradePoint ?? null,
                remarks: data.remarks || null,
                isPass: data.isPass != null ? Boolean(data.isPass) : true,
                sortOrder: data.sortOrder != null ? Number(data.sortOrder) : 0,
                status: data.status || "ACTIVE",
            },
            select: gradeSelect,
        });
        return mapGrade(created);
    }

    async updateGrade(id, data) {
        const updated = await prisma.grade.update({
            where: { id: Number(id) },
            data: {
                ...(data.gradeScaleId !== undefined
                    ? { gradeScaleId: data.gradeScaleId }
                    : {}),
                ...(data.grade !== undefined ? { grade: data.grade } : {}),
                ...(data.description !== undefined
                    ? { description: data.description }
                    : {}),
                ...(data.minimumScore !== undefined
                    ? { minimumScore: data.minimumScore }
                    : {}),
                ...(data.maximumScore !== undefined
                    ? { maximumScore: data.maximumScore }
                    : {}),
                ...(data.gradePoint !== undefined
                    ? { gradePoint: data.gradePoint }
                    : {}),
                ...(data.remarks !== undefined ? { remarks: data.remarks } : {}),
                ...(data.isPass !== undefined
                    ? { isPass: Boolean(data.isPass) }
                    : {}),
                ...(data.sortOrder !== undefined
                    ? { sortOrder: Number(data.sortOrder) }
                    : {}),
                ...(data.status !== undefined ? { status: data.status } : {}),
            },
            select: gradeSelect,
        });
        return mapGrade(updated);
    }

    async deactivateGrade(id) {
        return this.updateGrade(id, { status: "INACTIVE" });
    }

    async countResultsForGrade(gradeId) {
        return prisma.result.count({
            where: { gradeId: Number(gradeId), deletedAt: null },
        });
    }

    async ensureDefaultGradeScale() {
        const resultRepository = require("./result.repository");
        return resultRepository.ensureDefaultGradeScale();
    }
}

module.exports = new GradeRepository();
