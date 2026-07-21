const db = require("../database/db");

const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    role: {
        select: {
            id: true,
            name: true,
        },
    },
};

exports.findAllUsers = async() => {
    return await db.user.findMany({
        where: {
            deletedAt: null,
        },
        select: userSelect,
        orderBy: {
            id: "desc",
        },
    });
};

exports.findUserById = async(id) => {
    return await db.user.findFirst({
        where: {
            id: Number(id),
            deletedAt: null,
        },
        select: userSelect,
    });
};

exports.findUserByEmail = async(email) => {
    return await db.user.findFirst({
        where: {
            email,
            deletedAt: null,
        },
        include: {
            role: true,
        },
    });
};

exports.createUser = async(userData) => {
    return await db.user.create({
        data: userData,
        select: userSelect,
    });
};

exports.updateUser = async(id, userData) => {
    return await db.user.update({
        where: {
            id: Number(id),
        },
        data: userData,
        select: userSelect,
    });
};

exports.softDeleteUser = async(id) => {
    return await db.user.update({
        where: {
            id: Number(id),
        },
        data: {
            status: "ARCHIVED",
            deletedAt: new Date(),
        },
    });
};