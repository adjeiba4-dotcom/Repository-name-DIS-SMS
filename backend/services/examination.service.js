const examinationRepository = require("../repositories/examination.repository");

exports.getExaminations = async() => {
    return await examinationRepository.findAllExaminations();
};