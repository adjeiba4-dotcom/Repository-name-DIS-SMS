const db = require("../database/db");

exports.createAnnouncement = async(announcementData) => {
    return await db.announcement.create({
        data: announcementData,
    });
};