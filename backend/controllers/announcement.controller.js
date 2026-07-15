const announcementService = require("../services/announcement.service");

exports.getAnnouncements = async(req, res) => {
    const announcements = await announcementService.getAnnouncements();

    res.json({
        success: true,
        message: "Announcements retrieved successfully.",
        data: announcements,
    });
};