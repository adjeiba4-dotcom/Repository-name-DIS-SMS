const announcementService = require("../services/announcement.service");

exports.getAnnouncements = async(req, res, next) => {
    try {
        const announcements =
            await announcementService.getAnnouncements();

        res.status(200).json({
            success: true,
            message: "Announcements retrieved successfully.",
            data: announcements,
        });
    } catch (error) {
        next(error);
    }
};

exports.getAnnouncementById = async(req, res, next) => {
    try {
        const announcement =
            await announcementService.getAnnouncementById(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Announcement retrieved successfully.",
            data: announcement,
        });
    } catch (error) {
        next(error);
    }
};

exports.createAnnouncement = async(req, res, next) => {
    try {
        const announcement =
            await announcementService.createAnnouncement(
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Announcement created successfully.",
            data: announcement,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAnnouncement = async(req, res, next) => {
    try {
        const announcement =
            await announcementService.updateAnnouncement(
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Announcement updated successfully.",
            data: announcement,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteAnnouncement = async(req, res, next) => {
    try {
        const result =
            await announcementService.deleteAnnouncement(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};