const db = require("../database/db");

exports.findAllEvents = async() => {
    return await db.event.findMany({
        orderBy: {
            eventDate: "desc",
        },
    });
};