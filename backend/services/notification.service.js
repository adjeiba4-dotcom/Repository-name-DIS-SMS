const notificationRepository = require("../repositories/notification.repository");

exports.getNotifications = async() => {
    return await notificationRepository.findAllNotifications();
};