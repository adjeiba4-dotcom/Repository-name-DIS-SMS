const auditService = require("../services/audit.service");

exports.audit = (action, tableName) => {
    return async(req, res, next) => {
        const originalJson = res.json;

        res.json = function(body) {
            if (req.user && body.success) {
                auditService.createAuditLog({
                    userId: req.user.id,
                    action,
                    tableName,
                    recordId: body.data && body.data.id ? body.data.id : null,
                    ipAddress: req.ip,
                }).catch(console.error);
            }

            return originalJson.call(this, body);
        };

        next();
    };
};