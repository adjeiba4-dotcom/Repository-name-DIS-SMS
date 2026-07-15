const db = require("../database/db");

exports.createNotification = async(notificationData) => {
    return await db.notification.create({
        data: notificationData,
    });
};