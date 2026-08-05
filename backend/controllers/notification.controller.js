// controllers/notification.controller.js

const notificationService = require("../services/notification.service");
const ApiResponse = require("../utils/response");

function actorFrom(req) {
  return {
    userId: req.user?.id,
    roleName: req.user?.role?.name,
  };
}

exports.getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(
      req.query,
      actorFrom(req)
    );
    return ApiResponse.paginated(
      res,
      "Notifications retrieved successfully.",
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

exports.getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    return ApiResponse.success(
      res,
      "Unread notification count retrieved successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};

exports.getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(
      Number(req.params.id),
      actorFrom(req)
    );
    return ApiResponse.success(
      res,
      "Notification retrieved successfully.",
      notification
    );
  } catch (error) {
    next(error);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(
      req.body,
      actorFrom(req)
    );
    return ApiResponse.created(
      res,
      "Notification created successfully.",
      notification
    );
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      Number(req.params.id),
      actorFrom(req)
    );
    return ApiResponse.success(
      res,
      "Notification marked as read.",
      notification
    );
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return ApiResponse.success(res, "All notifications marked as read.", result);
  } catch (error) {
    next(error);
  }
};

exports.updateNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.updateNotification(
      Number(req.params.id),
      req.body,
      actorFrom(req)
    );
    return ApiResponse.success(
      res,
      "Notification updated successfully.",
      notification
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(
      Number(req.params.id)
    );
    return ApiResponse.success(
      res,
      "Notification deleted successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};
