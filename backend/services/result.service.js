const resultRepository = require("../repositories/result.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all results
 */
const getResults = async() => {
    return await resultRepository.findAllResults();
};

/**
 * Get result by ID
 */
const getResultById = async(id) => {

    const result =
        await resultRepository.findResultById(
            Number(id)
        );

    if (!result) {
        throw new NotFoundError("Result not found.");
    }

    return result;
};

/**
 * Search results
 */
const searchResults = async(keyword) => {
    return await resultRepository.searchResults(
        keyword || ""
    );
};

/**
 * Calculate Grade
 */
const calculateGrade = (score) => {

    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    if (score >= 40) return "E";

    return "F";
};

/**
 * Create Result
 */
const createResult = async(data) => {

    data.studentId = Number(data.studentId);
    data.examinationId = Number(data.examinationId);
    data.subjectId = Number(data.subjectId);
    data.termId = Number(data.termId);

    const student =
        await resultRepository.findStudentById(
            data.studentId
        );

    if (!student) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    const examination =
        await resultRepository.findExaminationById(
            data.examinationId
        );

    if (!examination) {
        throw new NotFoundError(
            "Examination not found."
        );
    }

    const subject =
        await resultRepository.findSubjectById(
            data.subjectId
        );

    if (!subject) {
        throw new NotFoundError(
            "Subject not found."
        );
    }

    const term =
        await resultRepository.findTermById(
            data.termId
        );

    if (!term) {
        throw new NotFoundError(
            "Term not found."
        );
    }

    const duplicate =
        await resultRepository.findResult(
            data.studentId,
            data.examinationId
        );

    if (duplicate) {
        throw new ConflictError(
            "Result already exists for this student and examination."
        );
    }

    const score = Number(data.marks);

    if (Number.isNaN(score)) {
        throw new BadRequestError(
            "Marks must be a valid number."
        );
    }

    if (score < 0 || score > 100) {
        throw new BadRequestError(
            "Marks must be between 0 and 100."
        );
    }

    data.marks = score;
    data.grade = calculateGrade(score);

    return await resultRepository.createResult(
        data
    );
};

/**
 * Update Result
 */
const updateResult = async(
    id,
    data
) => {

    const result =
        await resultRepository.findResultById(
            Number(id)
        );

    if (!result) {
        throw new NotFoundError(
            "Result not found."
        );
    }

    const studentId =
        data.studentId !== undefined ?
        Number(data.studentId) :
        result.studentId;

    const examinationId =
        data.examinationId !== undefined ?
        Number(data.examinationId) :
        result.examinationId;

    const subjectId =
        data.subjectId !== undefined ?
        Number(data.subjectId) :
        result.subjectId;

    const termId =
        data.termId !== undefined ?
        Number(data.termId) :
        result.termId;

    const marks =
        data.marks !== undefined ?
        Number(data.marks) :
        result.marks;
    const student =
        await resultRepository.findStudentById(
            studentId
        );

    if (!student) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    const examination =
        await resultRepository.findExaminationById(
            examinationId
        );

    if (!examination) {
        throw new NotFoundError(
            "Examination not found."
        );
    }

    const subject =
        await resultRepository.findSubjectById(
            subjectId
        );

    if (!subject) {
        throw new NotFoundError(
            "Subject not found."
        );
    }

    const term =
        await resultRepository.findTermById(
            termId
        );

    if (!term) {
        throw new NotFoundError(
            "Term not found."
        );
    }

    const duplicate =
        await resultRepository.findResult(
            studentId,
            examinationId
        );

    if (
        duplicate &&
        duplicate.id !== Number(id)
    ) {
        throw new ConflictError(
            "Result already exists for this student and examination."
        );
    }

    const score = Number(marks);

    if (Number.isNaN(score)) {
        throw new BadRequestError(
            "Marks must be a valid number."
        );
    }

    if (score < 0 || score > 100) {
        throw new BadRequestError(
            "Marks must be between 0 and 100."
        );
    }

    data.studentId = Number(studentId);
    data.examinationId = Number(examinationId);
    data.subjectId = Number(subjectId);
    data.termId = Number(termId);

    data.marks = score;
    data.grade = calculateGrade(score);

    return await resultRepository.updateResult(
        Number(id),
        data
    );
};

/**
 * Delete Result
 */
const deleteResult = async(id) => {

    const result =
        await resultRepository.findResultById(
            Number(id)
        );

    if (!result) {
        throw new NotFoundError(
            "Result not found."
        );
    }

    return await resultRepository.deleteResult(
        Number(id)
    );
};

module.exports = {
    getResults,
    getResultById,
    searchResults,
    createResult,
    updateResult,
    deleteResult,
};