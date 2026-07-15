const db = require("../database/db");

exports.findAllTerms = async() => {
    return await db.term.findMany({
        orderBy: {
            termName: "asc",
        },
    });
};

exports.createTerm = async(termData) => {
    return await db.term.create({
        data: termData,
    });
};