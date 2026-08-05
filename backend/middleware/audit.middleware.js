// middleware/audit.middleware.js — optional route-level audit wrapper

const auditService = require("../services/audit.service");

/**
 * Attach after successful JSON responses.
 * Usage: audit("CREATE", "Students", { entityType: "Student" })
 */
exports.audit = (action, moduleName, options = {}) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      if (req.user && body && body.success !== false) {
        const recordId =
          options.recordIdResolver?.(req, body) ??
          body?.data?.id ??
          null;

        auditService
          .recordSafe({
            userId: req.user.id,
            module: moduleName,
            action,
            entityType: options.entityType || null,
            recordId,
            description:
              options.description ||
              body?.message ||
              `${action} on ${moduleName}`,
            newValues: options.includeBody ? body?.data : undefined,
            ipAddress: req.ip,
            userAgent: req.get?.("user-agent") || null,
          })
          .catch(() => {});
      }

      return originalJson(body);
    };

    next();
  };
};
