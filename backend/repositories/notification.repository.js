const db = require("../database/db");

exports.findAllNotifications = async() => {
    return await db.notification.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};

exports.findNotificationById = async(id) => {
    return await db.notification.findUnique({
        where: {
            id: Number(id),
        },
    });
};

exports.createNotification = async(notificationData) => {
    return await db.notification.create({
        data: notificationData,
    });
};

exports.updateNotification = async(id, notificationData) => {
    return await db.notification.update({
        where: {
            id: Number(id),
        },
        data: notificationData,
    });
};

exports.deleteNotification = async(id) => {
    return await db.notification.delete({
        where: {
            id: Number(id),
        },
    });
};