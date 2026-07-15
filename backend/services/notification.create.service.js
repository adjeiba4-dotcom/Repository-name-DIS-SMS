const notificationRepository = require("../repositories/notification.create.repository");

exports.createNotification = async(notificationData) => {
    return await notificationRepository.createNotification(notificationData);
};