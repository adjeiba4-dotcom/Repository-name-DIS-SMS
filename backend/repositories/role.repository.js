// repositories/role.repository.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Get all active roles.
 */
exports.findAll = async() => {
    return await prisma.role.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            name: "asc",
        },
    });
};

/**
 * Find role by ID.
 */
exports.findById = async(id) => {
    return await prisma.role.findFirst({
        where: {
            id: parseInt(id, 10),
            deletedAt: null,
        },
    });
};

/**
 * Find role by name.
 */
exports.findByName = async(name) => {
    return await prisma.role.findFirst({
        where: {
            name,
            deletedAt: null,
        },
    });
};

/**
 * Create role.
 */
exports.create = async(data) => {
    return await prisma.role.create({
        data,
    });
};

/**
 * Update role.
 */
exports.update = async(id, data) => {
    return await prisma.role.update({
        where: {
            id: parseInt(id, 10),
        },
        data,
    });
};

/**
 * Activate role.
 */
exports.activate = async(id) => {
    return await prisma.role.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            status: "ACTIVE",
        },
    });
};

/**
 * Deactivate role.
 */
exports.deactivate = async(id) => {
    return await prisma.role.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            status: "INACTIVE",
        },
    });
};

/**
 * Soft delete role.
 */
exports.softDelete = async(id) => {
    return await prisma.role.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            deletedAt: new Date(),
        },
    });
};