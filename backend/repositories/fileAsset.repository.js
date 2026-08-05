// repositories/fileAsset.repository.js

const prisma = require("../database/db");

const fileSelect = {
  id: true,
  originalName: true,
  storedName: true,
  mimeType: true,
  sizeBytes: true,
  category: true,
  path: true,
  url: true,
  uploadedById: true,
  entityType: true,
  entityId: true,
  createdAt: true,
  deletedAt: true,
};

class FileAssetRepository {
  async create(data) {
    return prisma.fileAsset.create({
      data,
      select: fileSelect,
    });
  }

  async findById(id) {
    return prisma.fileAsset.findFirst({
      where: { id: Number(id), deletedAt: null },
      select: fileSelect,
    });
  }

  async softDelete(id) {
    return prisma.fileAsset.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
      select: fileSelect,
    });
  }

  async list({ category, entityType, entityId, page = 1, limit = 20 } = {}) {
    const where = { deletedAt: null };
    if (category) where.category = category;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = Number(entityId);

    const [total, data] = await Promise.all([
      prisma.fileAsset.count({ where }),
      prisma.fileAsset.findMany({
        where,
        select: fileSelect,
        orderBy: { createdAt: "desc" },
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
}

module.exports = new FileAssetRepository();
