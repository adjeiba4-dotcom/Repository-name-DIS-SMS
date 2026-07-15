const resultRepository = require("../repositories/result.create.repository");

exports.createResult = async(resultData) => {
    return await resultRepository.createResult(resultData);
};