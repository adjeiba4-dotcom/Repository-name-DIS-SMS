const subjectRepository = require("../repositories/subject.repository");

/**
 * Get all subjects
 */
exports.getSubjects = async () => {
    return subjectRepository.findAllSubjects();
};

/**
 * Get subject by ID
 */
exports.getSubjectById = async (id) => {
    const subject = await subjectRepository.findSubjectById(id);

    if (!subject || subject.deletedAt) {
        throw new Error("Subject not found.");
    }

    return subject;
};

/**
 * Search subjects
 */
exports.searchSubjects = async (keyword) => {
    return subjectRepository.searchSubjects(keyword);
};

/**
 * Archived subjects
 */
exports.getArchivedSubjects = async () => {
    return subjectRepository.findArchivedSubjects();
};

/**
 * Create subject
 */
exports.createSubject = async (data) => {

    const existing = await subjectRepository.findSubjectByCode(
        data.code
    );

    if (existing) {
        throw new Error("Subject code already exists.");
    }

    return subjectRepository.createSubject(data);
};

/**
 * Update subject
 */
exports.updateSubject = async (id, data) => {

    const subject = await subjectRepository.findSubjectById(id);

    if (!subject || subject.deletedAt) {
        throw new Error("Subject not found.");
    }

    if (data.code && data.code !== subject.code) {

        const existing =
            await subjectRepository.findSubjectByCode(
                data.code
            );

        if (existing && existing.id !== Number(id)) {
            throw new Error("Subject code already exists.");
        }
    }

    return subjectRepository.updateSubject(id, data);
};

/**
 * Archive subject
 */
exports.deleteSubject = async (id) => {

    const subject = await subjectRepository.findSubjectById(id);

    if (!subject || subject.deletedAt) {
        throw new Error("Subject not found.");
    }

    return subjectRepository.softDeleteSubject(id);
};

/**
 * Restore subject
 */
exports.restoreSubject = async (id) => {

    const subject = await subjectRepository.findSubjectById(id);

    if (!subject) {
        throw new Error("Subject not found.");
    }

    return subjectRepository.restoreSubject(id);
};