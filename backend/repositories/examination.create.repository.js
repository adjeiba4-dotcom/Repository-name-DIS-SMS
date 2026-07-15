const db = require("../database/db");

exports.createExamination = async (examinationData) => {
  return await db.examination.create({
    data: examinationData,
    include: {
      academicYear: true,
      term: true,
      class: true,
      subject: true,
    },
  });
};