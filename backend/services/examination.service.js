const examinationRepository = require("../repositories/examination.repository");

exports.getExaminations = async() => {
    return await examinationRepository.findAllExaminations();
};

exports.getExaminationById = async(id) => {
    const examination =
        await examinationRepository.findExaminationById(id);

    if (!examination) {
        throw new Error("Examination not found.");
    }

    return examination;
};

exports.createExamination = async(examData) => {
    return await examinationRepository.createExamination(
        examData
    );
};

exports.updateExamination = async(id, examData) => {
    const existingExamination =
        await examinationRepository.findExaminationById(id);

    if (!existingExamination) {
        throw new Error("Examination not found.");
    }

    return await examinationRepository.updateExamination(
        id,
        examData
    );
};

exports.deleteExamination = async(id) => {
    const existingExamination =
        await examinationRepository.findExaminationById(id);

    if (!existingExamination) {
        throw new Error("Examination not found.");
    }

    await examinationRepository.deleteExamination(id);

    return {
        id: Number(id),
    };
};