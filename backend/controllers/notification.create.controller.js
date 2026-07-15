const notificationService = require("../services/notification.create.service");

exports.createNotification = async(req, res) => {
    const notification = await notificationService.createNotification(req.body);

    res.status(201).json({
        success: true,
        message: "Notification created successfully.",
        data: notification,
    });
};