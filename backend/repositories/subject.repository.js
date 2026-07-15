const db = require("../database/db");

exports.findAllSubjects = async() => {
    return await db.subject.findMany({
        orderBy: {
            subjectName: "asc",
        },
    });
};

exports.createSubject = async(subjectData) => {
    return await db.subject.create({
        data: subjectData,
    });
};