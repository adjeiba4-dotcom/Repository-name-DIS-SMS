const eventService = require("../services/event.service");

exports.getEvents = async(req, res, next) => {
    try {
        const events = await eventService.getEvents();

        res.status(200).json({
            success: true,
            message: "Events retrieved successfully.",
            data: events,
        });
    } catch (error) {
        next(error);
    }
};

exports.getEventById = async(req, res, next) => {
    try {
        const event = await eventService.getEventById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Event retrieved successfully.",
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

exports.createEvent = async(req, res, next) => {
    try {
        const event = await eventService.createEvent(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Event created successfully.",
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateEvent = async(req, res, next) => {
    try {
        const event = await eventService.updateEvent(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Event updated successfully.",
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteEvent = async(req, res, next) => {
    try {
        const result = await eventService.deleteEvent(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Event deleted successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};