const announcementRepository = require("../repositories/announcement.repository");

exports.getAnnouncements = async() => {
    return await announcementRepository.findAllAnnouncements();
};