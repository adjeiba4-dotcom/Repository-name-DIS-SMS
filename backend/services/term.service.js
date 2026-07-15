const termRepository = require("../repositories/term.repository");

exports.getTerms = async() => {
    return await termRepository.findAllTerms();
};