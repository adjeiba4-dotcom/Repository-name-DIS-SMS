const feeRepository = require("../repositories/fee.repository");

exports.getFees = async() => {
    return await feeRepository.findAllFees();
};

exports.getFeeById = async(id) => {
    const fee = await feeRepository.findFeeById(id);

    if (!fee) {
        throw new Error("Fee not found.");
    }

    return fee;
};

exports.createFee = async(feeData) => {
    const existingFee =
        await feeRepository.findFeeByName(feeData.feeName);

    if (existingFee) {
        throw new Error("Fee already exists.");
    }

    return await feeRepository.createFee(feeData);
};

exports.updateFee = async(id, feeData) => {
    const existingFee =
        await feeRepository.findFeeById(id);

    if (!existingFee) {
        throw new Error("Fee not found.");
    }

    if (
        feeData.feeName &&
        feeData.feeName !== existingFee.feeName
    ) {
        const duplicate =
            await feeRepository.findFeeByName(
                feeData.feeName
            );

        if (duplicate) {
            throw new Error("Fee already exists.");
        }
    }

    return await feeRepository.updateFee(
        id,
        feeData
    );
};

exports.deleteFee = async(id) => {
    const existingFee =
        await feeRepository.findFeeById(id);

    if (!existingFee) {
        throw new Error("Fee not found.");
    }

    await feeRepository.deleteFee(id);

    return {
        id: Number(id),
    };
};