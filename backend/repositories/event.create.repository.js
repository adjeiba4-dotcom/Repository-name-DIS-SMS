const db = require("../database/db");

exports.createEvent = async(eventData) => {
    return await db.event.create({
        data: eventData,
    });
};