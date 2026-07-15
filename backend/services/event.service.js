const eventRepository = require("../repositories/event.repository");

exports.getEvents = async() => {
    return await eventRepository.findAllEvents();
};