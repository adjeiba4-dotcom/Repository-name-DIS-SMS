const db = require("../database/db");

exports.findAllAuditLogs = async() => {
    return await db.auditLog.findMany({
        include: {
            user: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

exports.findAuditLogById = async(id) => {
    return await db.auditLog.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            user: true,
        },
    });
};

exports.createAuditLog = async(auditData) => {
    return await db.auditLog.create({
        data: auditData,
        include: {
            user: true,
        },
    });
};

exports.deleteAuditLog = async(id) => {
    return await db.auditLog.delete({
        where: {
            id: Number(id),
        },
    });
};