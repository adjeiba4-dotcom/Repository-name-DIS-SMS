const db = require("../database/db");

exports.findUserByEmail = async(email) => {
    return await db.user.findFirst({
        where: {
            email,
            deletedAt: null,
        },
        include: {
            role: true,
        },
    });
};