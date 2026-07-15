const feeRepository = require("../repositories/fee.create.repository");

exports.createFee = async(feeData) => {
    return await feeRepository.createFee(feeData);
};