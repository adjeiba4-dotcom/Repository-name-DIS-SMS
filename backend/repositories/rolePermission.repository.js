// repositories/rolePermission.repository.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Get all role-permission assignments.
 */
exports.findAll = async() => {
    return await prisma.rolePermission.findMany({
        include: {
            role: true,
            permission: true,
        },
        orderBy: {
            roleId: "asc",
        },
    });
};

/**
 * Get permissions assigned to a role.
 */
exports.findByRole = async(roleId) => {
    return await prisma.rolePermission.findMany({
        where: {
            roleId: parseInt(roleId, 10),
        },
        include: {
            permission: true,
        },
    });
};

/**
 * Find one assignment.
 */
exports.findOne = async(roleId, permissionId) => {
    return await prisma.rolePermission.findUnique({
        where: {
            roleId_permissionId: {
                roleId: parseInt(roleId, 10),
                permissionId: parseInt(permissionId, 10),
            },
        },
    });
};

/**
 * Assign permission to role.
 */
exports.assign = async(roleId, permissionId) => {
    return await prisma.rolePermission.create({
        data: {
            roleId: parseInt(roleId, 10),
            permissionId: parseInt(permissionId, 10),
        },
    });
};

/**
 * Remove permission from role.
 */
exports.remove = async(roleId, permissionId) => {
    return await prisma.rolePermission.delete({
        where: {
            roleId_permissionId: {
                roleId: parseInt(roleId, 10),
                permissionId: parseInt(permissionId, 10),
            },
        },
    });
};

/**
 * Remove all permissions from a role.
 */
exports.removeAllByRole = async(roleId) => {
    return await prisma.rolePermission.deleteMany({
        where: {
            roleId: parseInt(roleId, 10),
        },
    });
};