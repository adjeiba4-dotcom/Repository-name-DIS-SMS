const auditRepository = require("../repositories/audit.repository");

exports.getAuditLogs = async() => {
    return await auditRepository.findAllAuditLogs();
};

exports.createAuditLog = async(auditData) => {
    return await auditRepository.createAuditLog(auditData);
};