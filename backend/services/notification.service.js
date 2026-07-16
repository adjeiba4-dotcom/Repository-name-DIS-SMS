const notificationRepository = require("../repositories/notification.repository");

exports.getNotifications = async() => {
    return await notificationRepository.findAllNotifications();
};

exports.getNotificationById = async(id) => {
    const notification =
        await notificationRepository.findNotificationById(id);

    if (!notification) {
        throw new Error("Notification not found.");
    }

    return notification;
};

exports.createNotification = async(notificationData) => {
    return await notificationRepository.createNotification(
        notificationData
    );
};

exports.updateNotification = async(id, notificationData) => {
    const existingNotification =
        await notificationRepository.findNotificationById(id);

    if (!existingNotification) {
        throw new Error("Notification not found.");
    }

    return await notificationRepository.updateNotification(
        id,
        notificationData
    );
};

exports.deleteNotification = async(id) => {
    const existingNotification =
        await notificationRepository.findNotificationById(id);

    if (!existingNotification) {
        throw new Error("Notification not found.");
    }

    await notificationRepository.deleteNotification(id);

    return {
        id: Number(id),
    };
};