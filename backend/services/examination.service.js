// services/examination.service.js

const examinationRepository = require("../repositories/examination.repository");

const getExaminations = async() => {
    return await examinationRepository.findAllExaminations();
};

const getExaminationById = async(id) => {
    const examination =
        await examinationRepository.findExaminationById(id);

    if (!examination) {
        throw new Error("Examination not found.");
    }

    return examination;
};

const searchExaminations = async(keyword) => {
    return await examinationRepository.searchExaminations(keyword);
};

const createExamination = async(data) => {
    const {
        name,
        subjectId,
        teacherId,
        academicYearId,
        termId,
    } = data;

    const subject =
        await examinationRepository.findSubjectById(subjectId);

    if (!subject) {
        throw new Error("Subject not found.");
    }

    const teacher =
        await examinationRepository.findTeacherById(teacherId);

    if (!teacher) {
        throw new Error("Teacher not found.");
    }

    const academicYear =
        await examinationRepository.findAcademicYearById(
            academicYearId
        );

    if (!academicYear) {
        throw new Error("Academic year not found.");
    }

    const term =
        await examinationRepository.findTermById(termId);

    if (!term) {
        throw new Error("Term not found.");
    }

    const existingExamination =
        await examinationRepository.findExamination(
            name,
            subjectId,
            academicYearId,
            termId
        );

    if (existingExamination) {
        throw new Error(
            "An examination with the same name already exists for this subject, academic year, and term."
        );
    }

    const { examDate, ...rest } = data;
    const payload = {
        ...rest,
        examinationDate: data.examinationDate || examDate,
    };

    if (payload.examinationDate) {
        payload.examinationDate = new Date(payload.examinationDate);
    }

    return await examinationRepository.createExamination(payload);
};

const updateExamination = async(id, data) => {
    const examination =
        await examinationRepository.findExaminationById(id);

    if (!examination) {
        throw new Error("Examination not found.");
    }

    const {
        name = examination.name,
            subjectId = examination.subjectId,
            teacherId = examination.teacherId,
            academicYearId = examination.academicYearId,
            termId = examination.termId,
    } = data;

    const subject =
        await examinationRepository.findSubjectById(subjectId);

    if (!subject) {
        throw new Error("Subject not found.");
    }

    const teacher =
        await examinationRepository.findTeacherById(teacherId);

    if (!teacher) {
        throw new Error("Teacher not found.");
    }

    const academicYear =
        await examinationRepository.findAcademicYearById(
            academicYearId
        );

    if (!academicYear) {
        throw new Error("Academic year not found.");
    }

    const term =
        await examinationRepository.findTermById(termId);

    if (!term) {
        throw new Error("Term not found.");
    }

    const existingExamination =
        await examinationRepository.findExamination(
            name,
            subjectId,
            academicYearId,
            termId
        );

    if (
        existingExamination &&
        existingExamination.id !== Number(id)
    ) {
        throw new Error(
            "An examination with the same name already exists for this subject, academic year, and term."
        );
    }

    const { examDate, ...rest } = data;
    const payload = { ...rest };

    if (data.examinationDate || examDate) {
        payload.examinationDate = new Date(
            data.examinationDate || examDate
        );
    }

    return await examinationRepository.updateExamination(
        id,
        payload
    );
};

const deleteExamination = async(id) => {
    const examination =
        await examinationRepository.findExaminationById(id);

    if (!examination) {
        throw new Error("Examination not found.");
    }

    return await examinationRepository.deleteExamination(id);
};

module.exports = {
    getExaminations,
    getExaminationById,
    searchExaminations,
    createExamination,
    updateExamination,
    deleteExamination,
};