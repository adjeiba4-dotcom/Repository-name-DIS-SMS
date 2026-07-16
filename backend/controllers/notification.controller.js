const notificationService = require("../services/notification.service");

exports.getNotifications = async(req, res, next) => {
    try {
        const notifications =
            await notificationService.getNotifications();

        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully.",
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

exports.getNotificationById = async(req, res, next) => {
    try {
        const notification =
            await notificationService.getNotificationById(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Notification retrieved successfully.",
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

exports.createNotification = async(req, res, next) => {
    try {
        const notification =
            await notificationService.createNotification(
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Notification created successfully.",
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateNotification = async(req, res, next) => {
    try {
        const notification =
            await notificationService.updateNotification(
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Notification updated successfully.",
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteNotification = async(req, res, next) => {
    try {
        const result =
            await notificationService.deleteNotification(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};