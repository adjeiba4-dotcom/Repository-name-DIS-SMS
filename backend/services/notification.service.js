// services/notification.service.js — in-app framework (email/SMS ready)

const notificationRepository = require("../repositories/notification.repository");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../errors");

const TYPES = ["INFO", "SUCCESS", "WARNING", "ERROR"];
const CHANNELS = ["IN_APP", "EMAIL", "SMS"];
const STATUSES = ["PENDING", "SENT", "FAILED", "READ"];

function assertType(type) {
  const value = String(type || "INFO").toUpperCase();
  if (!TYPES.includes(value)) {
    throw new BadRequestError(`Type must be one of: ${TYPES.join(", ")}.`);
  }
  return value;
}

function assertChannel(channel) {
  const value = String(channel || "IN_APP").toUpperCase();
  if (!CHANNELS.includes(value)) {
    throw new BadRequestError(
      `Channel must be one of: ${CHANNELS.join(", ")}.`
    );
  }
  return value;
}

/**
 * Future adapters for EMAIL / SMS can plug into deliver().
 * Currently only IN_APP is persisted as SENT immediately.
 */
async function deliver(notification) {
  if (notification.channel === "IN_APP") {
    return {
      ...notification,
      status: "SENT",
    };
  }

  // Placeholder for future email/SMS providers
  return {
    ...notification,
    status: "PENDING",
    meta: {
      ...(notification.meta || {}),
      deliveryNote: `${notification.channel} delivery is prepared but not yet enabled.`,
    },
  };
}

class NotificationService {
  /**
   * Primary framework entry used by other modules.
   */
  async notify({
    userId,
    title,
    message,
    type = "INFO",
    channel = "IN_APP",
    entityType = null,
    entityId = null,
    meta = null,
  } = {}) {
    if (!userId) throw new BadRequestError("userId is required.");
    if (!title || !String(title).trim()) {
      throw new BadRequestError("title is required.");
    }
    if (!message || !String(message).trim()) {
      throw new BadRequestError("message is required.");
    }

    const payload = {
      userId: Number(userId),
      title: String(title).trim(),
      message: String(message).trim(),
      type: assertType(type),
      channel: assertChannel(channel),
      entityType: entityType || null,
      entityId: entityId != null ? Number(entityId) : null,
      meta: meta || undefined,
      status: "PENDING",
      isRead: false,
    };

    const created = await notificationRepository.create(payload);
    const delivered = await deliver(created);

    if (
      delivered.status !== created.status ||
      delivered.meta !== created.meta
    ) {
      return notificationRepository.update(created.id, {
        status: delivered.status,
        meta: delivered.meta || undefined,
      });
    }

    return created;
  }

  async getNotifications(query = {}, actor = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const search = (query.search || query.keyword || "").trim();

    // Non-admins only see their own inbox
    const isAdmin = actor.roleName === "Administrator";
    const userId = isAdmin && query.userId ? Number(query.userId) : actor.userId;

    return notificationRepository.findNotifications({
      page,
      limit,
      userId,
      isRead:
        query.isRead === undefined
          ? undefined
          : String(query.isRead) === "true",
      type: query.type ? assertType(query.type) : null,
      channel: query.channel ? assertChannel(query.channel) : null,
      search,
    });
  }

  async getUnreadCount(userId) {
    return {
      unreadCount: await notificationRepository.countUnread(userId),
    };
  }

  async getNotificationById(id, actor = {}) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError("Notification not found.");
    }

    if (
      actor.roleName !== "Administrator" &&
      notification.userId !== Number(actor.userId)
    ) {
      throw new ForbiddenError("You cannot access this notification.");
    }

    return notification;
  }

  async createNotification(data, actor = {}) {
    return this.notify({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      channel: data.channel,
      entityType: data.entityType,
      entityId: data.entityId,
      meta: data.meta,
    });
  }

  async markAsRead(id, actor = {}) {
    const notification = await this.getNotificationById(id, actor);
    if (notification.isRead) return notification;

    return notificationRepository.update(id, {
      isRead: true,
      readAt: new Date(),
      status: "READ",
    });
  }

  async markAllAsRead(userId) {
    const result = await notificationRepository.markAllRead(userId);
    return { updated: result.count };
  }

  async updateNotification(id, data, actor = {}) {
    await this.getNotificationById(id, { ...actor, roleName: "Administrator" });

    const payload = {};
    if (data.title !== undefined) payload.title = String(data.title).trim();
    if (data.message !== undefined) payload.message = String(data.message).trim();
    if (data.type !== undefined) payload.type = assertType(data.type);
    if (data.channel !== undefined) payload.channel = assertChannel(data.channel);
    if (data.status !== undefined) {
      const status = String(data.status).toUpperCase();
      if (!STATUSES.includes(status)) {
        throw new BadRequestError(
          `Status must be one of: ${STATUSES.join(", ")}.`
        );
      }
      payload.status = status;
    }

    return notificationRepository.update(id, payload);
  }

  async deleteNotification(id) {
    const existing = await notificationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Notification not found.");
    }
    await notificationRepository.delete(id);
    return { id: Number(id) };
  }
}

module.exports = new NotificationService();
