// services/audit.service.js — reusable Audit Trail

const auditRepository = require("../repositories/audit.repository");
const { NotFoundError, BadRequestError } = require("../errors");

class AuditService {
  /**
   * Record an entity change. Safe to call fire-and-forget from other services.
   * Never throws to callers when used via recordSafe().
   */
  async record({
    userId,
    module,
    action,
    entityType = null,
    recordId = null,
    description = null,
    oldValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null,
  } = {}) {
    if (!userId) {
      throw new BadRequestError("Audit userId is required.");
    }
    if (!module || !action) {
      throw new BadRequestError("Audit module and action are required.");
    }

    return auditRepository.createAuditLog({
      userId: Number(userId),
      module: String(module).trim(),
      action: String(action).trim().toUpperCase(),
      entityType: entityType ? String(entityType).trim() : null,
      recordId: recordId != null ? Number(recordId) : null,
      description: description || null,
      oldValues: oldValues ?? undefined,
      newValues: newValues ?? undefined,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });
  }

  async recordSafe(payload) {
    try {
      return await this.record(payload);
    } catch (error) {
      console.error("[audit] Failed to record audit log:", error.message);
      return null;
    }
  }

  async getAuditLogs(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const search = (query.search || query.keyword || "").trim();

    return auditRepository.findAuditLogs({
      page,
      limit,
      module: query.module ? String(query.module).trim() : null,
      action: query.action ? String(query.action).trim().toUpperCase() : null,
      entityType: query.entityType ? String(query.entityType).trim() : null,
      userId: query.userId ? Number(query.userId) : null,
      search,
      sortBy: (query.sortBy || "createdAt").trim(),
      sortOrder: (query.sortOrder || "desc").trim().toLowerCase(),
    });
  }

  async getAuditLogById(id) {
    const auditLog = await auditRepository.findAuditLogById(id);
    if (!auditLog) {
      throw new NotFoundError("Audit log not found.");
    }
    return auditLog;
  }
}

module.exports = new AuditService();
