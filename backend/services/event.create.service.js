const eventRepository = require("../repositories/event.create.repository");

exports.createEvent = async(eventData) => {
    return await eventRepository.createEvent(eventData);
};