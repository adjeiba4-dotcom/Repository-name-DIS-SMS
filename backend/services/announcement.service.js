const announcementRepository = require("../repositories/announcement.repository");
const { applyDateFields } = require("../utils/date");

const ANNOUNCEMENT_DATE_FIELDS = ["publishDate", "expiryDate"];

exports.getAnnouncements = async() => {
    return await announcementRepository.findAllAnnouncements();
};

exports.getAnnouncementById = async(id) => {
    const announcement =
        await announcementRepository.findAnnouncementById(id);

    if (!announcement) {
        throw new Error("Announcement not found.");
    }

    return announcement;
};

exports.createAnnouncement = async(announcementData) => {
    return await announcementRepository.createAnnouncement(
        applyDateFields(announcementData, ANNOUNCEMENT_DATE_FIELDS, {
            allowNull: true,
        })
    );
};

exports.updateAnnouncement = async(id, announcementData) => {
    const existingAnnouncement =
        await announcementRepository.findAnnouncementById(id);

    if (!existingAnnouncement) {
        throw new Error("Announcement not found.");
    }

    return await announcementRepository.updateAnnouncement(
        id,
        applyDateFields(announcementData, ANNOUNCEMENT_DATE_FIELDS, {
            allowNull: true,
        })
    );
};

exports.deleteAnnouncement = async(id) => {
    const existingAnnouncement =
        await announcementRepository.findAnnouncementById(id);

    if (!existingAnnouncement) {
        throw new Error("Announcement not found.");
    }

    await announcementRepository.deleteAnnouncement(id);

    return {
        id: Number(id),
    };
};