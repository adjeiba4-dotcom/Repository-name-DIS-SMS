const eventService = require("../services/event.service");

exports.getEvents = async(req, res) => {
    const events = await eventService.getEvents();

    res.json({
        success: true,
        message: "Events retrieved successfully.",
        data: events,
    });
};