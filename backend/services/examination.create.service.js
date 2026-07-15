const examinationRepository = require("../repositories/examination.create.repository");

exports.createExamination = async (examinationData) => {
  return await examinationRepository.createExamination(examinationData);
};