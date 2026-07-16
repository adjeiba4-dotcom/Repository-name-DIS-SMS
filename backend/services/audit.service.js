const auditRepository = require("../repositories/audit.repository");

exports.getAuditLogs = async() => {
    return await auditRepository.findAllAuditLogs();
};

exports.getAuditLogById = async(id) => {
    const auditLog =
        await auditRepository.findAuditLogById(id);

    if (!auditLog) {
        throw new Error("Audit log not found.");
    }

    return auditLog;
};

exports.createAuditLog = async(auditData) => {
    return await auditRepository.createAuditLog(
        auditData
    );
};

exports.deleteAuditLog = async(id) => {
    const existingAuditLog =
        await auditRepository.findAuditLogById(id);

    if (!existingAuditLog) {
        throw new Error("Audit log not found.");
    }

    await auditRepository.deleteAuditLog(id);

    return {
        id: Number(id),
    };
};