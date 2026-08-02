// repositories/dashboard.repository.js

const prisma = require("../database/db");

const findAllDashboards = async() => {
    return await prisma.dashboard.findMany({
        include: {
            creator: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            widgets: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const findDashboardById = async(id) => {
    return await prisma.dashboard.findUnique({
        where: {
            id,
        },
        include: {
            creator: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            widgets: true,
        },
    });
};

const findDashboardByName = async(name) => {
    return await prisma.dashboard.findUnique({
        where: {
            name,
        },
    });
};

const findUserById = async(id) => {
    return await prisma.user.findUnique({
        where: {
            id,
        },
    });
};

const searchDashboards = async(keyword) => {
    return await prisma.dashboard.findMany({
        where: {
            OR: [{
                    name: {
                        contains: keyword,
                    },
                },
                {
                    description: {
                        contains: keyword,
                    },
                },
            ],
        },
        include: {
            creator: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
            widgets: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const createDashboard = async(data) => {
    return await prisma.dashboard.create({
        data,
        include: {
            creator: true,
            widgets: true,
        },
    });
};

const updateDashboard = async(id, data) => {
    return await prisma.dashboard.update({
        where: {
            id,
        },
        data,
        include: {
            creator: true,
            widgets: true,
        },
    });
};

const deleteDashboard = async(id) => {
    return await prisma.dashboard.delete({
        where: {
            id,
        },
    });
};

module.exports = {
    findAllDashboards,
    findDashboardById,
    findDashboardByName,
    findUserById,
    searchDashboards,
    createDashboard,
    updateDashboard,
    deleteDashboard,
};