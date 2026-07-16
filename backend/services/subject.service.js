const subjectRepository = require("../repositories/subject.repository");

exports.getSubjects = async() => {
    return await subjectRepository.findAllSubjects();
};

exports.getSubjectById = async(id) => {
    const subject = await subjectRepository.findSubjectById(id);

    if (!subject) {
        throw new Error("Subject not found.");
    }

    return subject;
};

exports.createSubject = async(subjectData) => {
    const existingSubject =
        await subjectRepository.findSubjectByCode(
            subjectData.subjectCode
        );

    if (existingSubject) {
        throw new Error("Subject code already exists.");
    }

    return await subjectRepository.createSubject(subjectData);
};

exports.updateSubject = async(id, subjectData) => {
    const existingSubject =
        await subjectRepository.findSubjectById(id);

    if (!existingSubject) {
        throw new Error("Subject not found.");
    }

    if (
        subjectData.subjectCode &&
        subjectData.subjectCode !== existingSubject.subjectCode
    ) {
        const duplicate =
            await subjectRepository.findSubjectByCode(
                subjectData.subjectCode
            );

        if (duplicate) {
            throw new Error("Subject code already exists.");
        }
    }

    return await subjectRepository.updateSubject(
        id,
        subjectData
    );
};

exports.deleteSubject = async(id) => {
    const existingSubject =
        await subjectRepository.findSubjectById(id);

    if (!existingSubject) {
        throw new Error("Subject not found.");
    }

    await subjectRepository.deleteSubject(id);

    return {
        id: Number(id),
    };
};