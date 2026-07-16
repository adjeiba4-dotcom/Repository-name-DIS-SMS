const auditService = require("../services/audit.service");

exports.getAuditLogs = async(req, res, next) => {
    try {
        const auditLogs = await auditService.getAuditLogs();

        res.status(200).json({
            success: true,
            message: "Audit logs retrieved successfully.",
            data: auditLogs,
        });
    } catch (error) {
        next(error);
    }
};

exports.getAuditLogById = async(req, res, next) => {
    try {
        const auditLog = await auditService.getAuditLogById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Audit log retrieved successfully.",
            data: auditLog,
        });
    } catch (error) {
        next(error);
    }
};

exports.createAuditLog = async(req, res, next) => {
    try {
        const auditLog = await auditService.createAuditLog(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Audit log created successfully.",
            data: auditLog,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteAuditLog = async(req, res, next) => {
    try {
        const result = await auditService.deleteAuditLog(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Audit log deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};