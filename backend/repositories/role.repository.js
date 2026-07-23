const prisma = require("../config/prisma");

const roleSelect = {
    id: true,
    name: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
};

const findAllRoles = () =>
    prisma.role.findMany({
        where: {
            deletedAt: null,
        },
        select: roleSelect,
        orderBy: {
            name: "asc",
        },
    });

const findRoleById = (id) =>
    prisma.role.findFirst({
        where: {
            id: Number(id),
            deletedAt: null,
        },
        select: roleSelect,
    });

const findRoleByName = (name) =>
    prisma.role.findFirst({
        where: {
            name,
            deletedAt: null,
        },
    });

const createRole = (data) =>
    prisma.role.create({
        data,
        select: roleSelect,
    });

const updateRole = (id, data) =>
    prisma.role.update({
        where: {
            id: Number(id),
        },
        data,
        select: roleSelect,
    });

const softDeleteRole = (id) =>
    prisma.role.update({
        where: {
            id: Number(id),
        },
        data: {
            status: "ARCHIVED",
            deletedAt: new Date(),
        },
    });

module.exports = {
    findAllRoles,
    findRoleById,
    findRoleByName,
    createRole,
    updateRole,
    softDeleteRole,
};