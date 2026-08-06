const eventRepository = require("../repositories/event.repository");
const { applyDateFields } = require("../utils/date");

const EVENT_DATE_FIELDS = ["startDate", "endDate"];

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
    return await eventRepository.createEvent(
        applyDateFields(eventData, EVENT_DATE_FIELDS)
    );
};

exports.updateEvent = async(id, eventData) => {
    const existingEvent =
        await eventRepository.findEventById(id);

    if (!existingEvent) {
        throw new Error("Event not found.");
    }

    return await eventRepository.updateEvent(
        id,
        applyDateFields(eventData, EVENT_DATE_FIELDS)
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