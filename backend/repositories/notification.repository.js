// repositories/notification.repository.js

const prisma = require("../database/db");

const notificationSelect = {
  id: true,
  title: true,
  message: true,
  type: true,
  status: true,
  channel: true,
  userId: true,
  isRead: true,
  readAt: true,
  entityType: true,
  entityId: true,
  meta: true,
  createdAt: true,
  updatedAt: true,
};

class NotificationRepository {
  async findNotifications({
    page = 1,
    limit = 20,
    userId,
    isRead,
    type,
    channel,
    search,
  } = {}) {
    const where = {};
    if (userId) where.userId = Number(userId);
    if (typeof isRead === "boolean") where.isRead = isRead;
    if (type) where.type = type;
    if (channel) where.channel = channel;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        select: notificationSelect,
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

  async findById(id) {
    return prisma.notification.findUnique({
      where: { id: Number(id) },
      select: notificationSelect,
    });
  }

  async create(data) {
    return prisma.notification.create({
      data,
      select: notificationSelect,
    });
  }

  async update(id, data) {
    return prisma.notification.update({
      where: { id: Number(id) },
      data,
      select: notificationSelect,
    });
  }

  async delete(id) {
    return prisma.notification.delete({
      where: { id: Number(id) },
      select: notificationSelect,
    });
  }

  async countUnread(userId) {
    return prisma.notification.count({
      where: { userId: Number(userId), isRead: false },
    });
  }

  async markAllRead(userId) {
    return prisma.notification.updateMany({
      where: { userId: Number(userId), isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
        status: "READ",
      },
    });
  }
}

module.exports = new NotificationRepository();
