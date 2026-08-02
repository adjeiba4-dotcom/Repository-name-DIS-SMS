// repositories/user.repository.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Get all active users.
 */
exports.findAll = async() => {
    return await prisma.user.findMany({
        where: {
            deletedAt: null,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roleId: true,
            status: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

/**
 * Find user by ID.
 */
exports.findById = async(id) => {
    return await prisma.user.findUnique({
        where: {
            id: parseInt(id, 10),
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            roleId: true,
            status: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

/**
 * Find user by email.
 */
exports.findByEmail = async(email) => {
    return await prisma.user.findFirst({
        where: {
            email: email.toLowerCase(),
            deletedAt: null,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            password: true,
            roleId: true,
            status: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

/**
 * Create new user.
 */
exports.create = async(data) => {
    return await prisma.user.create({
        data,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roleId: true,
            status: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

/**
 * Update user.
 */
exports.update = async(id, data) => {
    return await prisma.user.update({
        where: {
            id: parseInt(id, 10),
        },
        data,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roleId: true,
            status: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true,
            role: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

/**
 * Soft delete user.
 */
exports.softDelete = async(id) => {
    return await prisma.user.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            deletedAt: new Date(),
        },
    });
};

/**
 * Activate user.
 */
exports.activate = async(id) => {
    return await prisma.user.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            status: "ACTIVE",
        },
    });
};

/**
 * Deactivate user.
 */
exports.deactivate = async(id) => {
    return await prisma.user.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            status: "INACTIVE",
        },
    });
};

/**
 * Update password.
 */
exports.updatePassword = async(id, password) => {
    return await prisma.user.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            password,
        },
    });
};

/**
 * Update last login timestamp.
 */
exports.updateLastLogin = async(id) => {
    return await prisma.user.update({
        where: {
            id: parseInt(id, 10),
        },
        data: {
            lastLogin: new Date(),
        },
    });
};