// repositories/permission.repository.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Get all permissions.
 */
exports.findAll = async() => {
    return await prisma.permission.findMany({
        orderBy: [{
                module: "asc",
            },
            {
                name: "asc",
            },
        ],
    });
};

/**
 * Find permission by ID.
 */
exports.findById = async(id) => {
    return await prisma.permission.findUnique({
        where: {
            id: parseInt(id, 10),
        },
    });
};

/**
 * Find permission by module and name.
 */
exports.findByModuleAndName = async(module, name) => {
    return await prisma.permission.findFirst({
        where: {
            module,
            name,
        },
    });
};

/**
 * Create permission.
 */
exports.create = async(data) => {
    return await prisma.permission.create({
        data,
    });
};

/**
 * Update permission.
 */
exports.update = async(id, data) => {
    return await prisma.permission.update({
        where: {
            id: parseInt(id, 10),
        },
        data,
    });
};

/**
 * Delete permission.
 */
exports.delete = async(id) => {
    return await prisma.permission.delete({
        where: {
            id: parseInt(id, 10),
        },
    });
};