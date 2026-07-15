const subjectRepository = require("../repositories/subject.repository");

exports.getSubjects = async() => {
    return await subjectRepository.findAllSubjects();
};