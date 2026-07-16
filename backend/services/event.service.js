const eventRepository = require("../repositories/event.repository");

exports.getEvents = async() => {
    return await eventRepository.findAllEvents();
};

exports.getEventById = async(id) => {
    const event = await eventRepository.findEventById(id);

    if (!event) {
        throw new Error("Event not found.");
    }

    return event;
};

exports.createEvent = async(eventData) => {
    return await eventRepository.createEvent(eventData);
};

exports.updateEvent = async(id, eventData) => {
    const existingEvent =
        await eventRepository.findEventById(id);

    if (!existingEvent) {
        throw new Error("Event not found.");
    }

    return await eventRepository.updateEvent(
        id,
        eventData
    );
};

exports.deleteEvent = async(id) => {
    const existingEvent =
        await eventRepository.findEventById(id);

    if (!existingEvent) {
        throw new Error("Event not found.");
    }

    await eventRepository.deleteEvent(id);

    return {
        id: Number(id),
    };
};