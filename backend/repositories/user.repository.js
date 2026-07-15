const db = require("../database/db");

exports.findAllUsers = async() => {
    return await db.user.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
        },
        orderBy: {
            id: "desc",
        },
    });
};

exports.findUserById = async(id) => {
    return await db.user.findUnique({
        where: {
            id: Number(id),
        },
    });
};

exports.findUserByEmail = async(email) => {
    return await db.user.findUnique({
        where: {
            email,
        },
    });
};

exports.createUser = async(userData) => {
    return await db.user.create({
        data: userData,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
        },
    });
};

exports.updateUser = async(id, userData) => {
    return await db.user.update({
        where: {
            id: Number(id),
        },
        data: userData,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
        },
    });
};
exports.deleteUser = async(id) => {
    return await db.user.delete({
        where: {
            id: Number(id),
        },
    });
};