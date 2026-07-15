const auditService = require("../services/audit.service");

exports.getAuditLogs = async(req, res) => {
    const logs = await auditService.getAuditLogs();

    res.json({
        success: true,
        message: "Audit logs retrieved successfully.",
        data: logs,
    });
};