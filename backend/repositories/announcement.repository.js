const db = require("../database/db");

exports.findAllAnnouncements = async() => {
    return await db.announcement.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};