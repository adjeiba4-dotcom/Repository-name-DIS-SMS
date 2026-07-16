const db = require("../database/db");

exports.findAllEvents = async() => {
    return await db.event.findMany({
        orderBy: {
            eventDate: "desc",
        },
    });
};

exports.findEventById = async(id) => {
    return await db.event.findUnique({
        where: {
            id: Number(id),
        },
    });
};

exports.createEvent = async(eventData) => {
    return await db.event.create({
        data: eventData,
    });
};

exports.updateEvent = async(id, eventData) => {
    return await db.event.update({
        where: {
            id: Number(id),
        },
        data: eventData,
    });
};

exports.deleteEvent = async(id) => {
    return await db.event.delete({
        where: {
            id: Number(id),
        },
    });
};