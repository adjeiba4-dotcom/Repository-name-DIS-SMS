// repositories/audit.repository.js

const prisma = require("../database/db");

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
};

const auditSelect = {
  id: true,
  userId: true,
  module: true,
  action: true,
  entityType: true,
  recordId: true,
  description: true,
  oldValues: true,
  newValues: true,
  ipAddress: true,
  userAgent: true,
  createdAt: true,
  user: { select: userSelect },
};

class AuditRepository {
  async findAuditLogs({
    page = 1,
    limit = 20,
    module,
    action,
    entityType,
    userId,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = {}) {
    const where = {};

    if (module) where.module = module;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = Number(userId);

    if (search) {
      where.OR = [
        { module: { contains: search } },
        { action: { contains: search } },
        { description: { contains: search } },
        { entityType: { contains: search } },
      ];
    }

    const allowedSort = ["createdAt", "module", "action", "id"];
    const orderField = allowedSort.includes(sortBy) ? sortBy : "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const [total, data] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        select: auditSelect,
        orderBy: { [orderField]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findAuditLogById(id) {
    return prisma.auditLog.findUnique({
      where: { id: Number(id) },
      select: auditSelect,
    });
  }

  async createAuditLog(data) {
    return prisma.auditLog.create({
      data,
      select: auditSelect,
    });
  }
}

module.exports = new AuditRepository();
