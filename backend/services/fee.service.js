const feeRepository = require("../repositories/fee.repository");

exports.getFees = async() => {
    return await feeRepository.findAllFees();
};