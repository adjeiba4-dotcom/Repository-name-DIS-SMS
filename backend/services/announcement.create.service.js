const announcementRepository = require("../repositories/announcement.create.repository");

exports.createAnnouncement = async(announcementData) => {
    return await announcementRepository.createAnnouncement(announcementData);
};