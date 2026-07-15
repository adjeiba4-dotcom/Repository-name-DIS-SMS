const notificationService = require("../services/notification.service");

exports.getNotifications = async(req, res) => {
    const notifications = await notificationService.getNotifications();

    res.json({
        success: true,
        message: "Notifications retrieved successfully.",
        data: notifications,
    });
};