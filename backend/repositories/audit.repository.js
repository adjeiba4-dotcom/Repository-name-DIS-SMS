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

exports.createAuditLog = async(auditData) => {
    return await db.auditLog.create({
        data: auditData,
    });
};