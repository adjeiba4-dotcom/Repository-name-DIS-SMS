const db = require("../database/db");

exports.findAllNotifications = async() => {
    return await db.notification.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};