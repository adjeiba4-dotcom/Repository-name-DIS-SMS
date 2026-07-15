const eventService = require("../services/event.create.service");

exports.createEvent = async(req, res) => {
    const event = await eventService.createEvent(req.body);

    res.status(201).json({
        success: true,
        message: "Event created successfully.",
        data: event,
    });
};