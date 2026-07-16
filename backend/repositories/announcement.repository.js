const db = require("../database/db");

exports.findAllAnnouncements = async() => {
    return await db.announcement.findMany({
        orderBy: {
            publishDate: "desc",
        },
    });
};

exports.findAnnouncementById = async(id) => {
    return await db.announcement.findUnique({
        where: {
            id: Number(id),
        },
    });
};

exports.createAnnouncement = async(announcementData) => {
    return await db.announcement.create({
        data: announcementData,
    });
};

exports.updateAnnouncement = async(id, announcementData) => {
    return await db.announcement.update({
        where: {
            id: Number(id),
        },
        data: announcementData,
    });
};

exports.deleteAnnouncement = async(id) => {
    return await db.announcement.delete({
        where: {
            id: Number(id),
        },
    });
};