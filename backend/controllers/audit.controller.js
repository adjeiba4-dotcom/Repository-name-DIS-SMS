// controllers/audit.controller.js

const auditService = require("../services/audit.service");
const ApiResponse = require("../utils/response");

exports.getAuditLogs = async (req, res, next) => {
  try {
    const result = await auditService.getAuditLogs(req.query);
    return ApiResponse.paginated(
      res,
      "Audit logs retrieved successfully.",
      result.data,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    );
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogById = async (req, res, next) => {
  try {
    const auditLog = await auditService.getAuditLogById(Number(req.params.id));
    return ApiResponse.success(
      res,
      "Audit log retrieved successfully.",
      auditLog
    );
  } catch (error) {
    next(error);
  }
};
