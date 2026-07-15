const resultRepository = require("../repositories/result.repository");

exports.getResults = async() => {
    return await resultRepository.findAllResults();
};