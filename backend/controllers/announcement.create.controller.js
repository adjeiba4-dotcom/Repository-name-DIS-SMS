const announcementService = require("../services/announcement.create.service");

exports.createAnnouncement = async(req, res) => {
    const announcement = await announcementService.createAnnouncement(req.body);

    res.status(201).json({
        success: true,
        message: "Announcement created successfully.",
        data: announcement,
    });
};