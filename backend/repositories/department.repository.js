const prisma = require("../database/db");

const departmentSelect = {
    id: true,
    code: true,
    name: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,

    teachers: true,
    subjects: true,
    employees: true,
    stockIssues: true,
};

const departmentConflictSelect = {
    id: true,
    code: true,
    name: true,
    status: true,
    deletedAt: true,
};

exports.findAllDepartments = async() => {
    return prisma.department.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            name: "asc",
        },
        select: departmentSelect,
    });
};

exports.findDepartmentById = async(id) => {
    return prisma.department.findUnique({
        where: { id },
        select: departmentSelect,
    });
};

/**
 * Lookup by code across active and archived rows (unique constraint spans both).
 * Pass excludeId when updating so the current row is ignored.
 */
exports.findDepartmentByCode = async(code, { excludeId = null } = {}) => {
    if (!code) return null;

    return prisma.department.findFirst({
        where: {
            code,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: departmentConflictSelect,
    });
};

/**
 * Lookup by name across active and archived rows (unique constraint spans both).
 * Pass excludeId when updating so the current row is ignored.
 */
exports.findDepartmentByName = async(name, { excludeId = null } = {}) => {
    if (!name) return null;

    return prisma.department.findFirst({
        where: {
            name,
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: departmentConflictSelect,
    });
};

exports.searchDepartments = async(keyword) => {
    return prisma.department.findMany({
        where: {
            deletedAt: null,
            OR: [{
                    code: {
                        contains: keyword,
                    },
                },
                {
                    name: {
                        contains: keyword,
                    },
                },
            ],
        },
        orderBy: {
            name: "asc",
        },
        select: departmentSelect,
    });
};

exports.createDepartment = async(data) => {
    return prisma.department.create({
        data,
        select: departmentSelect,
    });
};

exports.updateDepartment = async(id, data) => {
    return prisma.department.update({
        where: { id },
        data,
        select: departmentSelect,
    });
};

exports.softDeleteDepartment = async(id) => {
    return prisma.department.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
        select: departmentSelect,
    });
};

exports.restoreDepartment = async(id) => {
    return prisma.department.update({
        where: { id },
        data: {
            deletedAt: null,
        },
        select: departmentSelect,
    });
};

exports.findArchivedDepartments = async() => {
    return prisma.department.findMany({
        where: {
            deletedAt: {
                not: null,
            },
        },
        orderBy: {
            name: "asc",
        },
        select: departmentSelect,
    });
};
