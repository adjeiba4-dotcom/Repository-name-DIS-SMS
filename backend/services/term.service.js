const termRepository = require("../repositories/term.repository");

exports.getTerms = async() => {
    return await termRepository.findAllTerms();
};

exports.getTermById = async(id) => {
    const term = await termRepository.findTermById(id);

    if (!term) {
        throw new Error("Term not found.");
    }

    return term;
};

exports.createTerm = async(termData) => {
    return await termRepository.createTerm(termData);
};

exports.updateTerm = async(id, termData) => {
    const existingTerm = await termRepository.findTermById(id);

    if (!existingTerm) {
        throw new Error("Term not found.");
    }

    return await termRepository.updateTerm(
        id,
        termData
    );
};

exports.deleteTerm = async(id) => {
    const existingTerm = await termRepository.findTermById(id);

    if (!existingTerm) {
        throw new Error("Term not found.");
    }

    await termRepository.deleteTerm(id);

    return {
        id: Number(id),
    };
};