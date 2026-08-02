// services/feeType.service.js

const feeTypeRepository = require("../repositories/feeType.repository");

const getFeeTypes = async() => {
    return await feeTypeRepository.findAllFeeTypes();
};

const getFeeTypeById = async(id) => {
    const feeType = await feeTypeRepository.findFeeTypeById(id);

    if (!feeType) {
        throw new Error("Fee type not found.");
    }

    return feeType;
};

const searchFeeTypes = async(keyword) => {
    return await feeTypeRepository.searchFeeTypes(keyword);
};

const createFeeType = async(data) => {
    const {
        code,
        name,
    } = data;

    // Check duplicate code
    const existingCode =
        await feeTypeRepository.findFeeTypeByCode(code);

    if (existingCode) {
        throw new Error(
            "Fee type code already exists."
        );
    }

    // Check duplicate name
    const existingName =
        await feeTypeRepository.findFeeTypeByName(name);

    if (existingName) {
        throw new Error(
            "Fee type name already exists."
        );
    }

    return await feeTypeRepository.createFeeType(data);
};

const updateFeeType = async(id, data) => {
    const feeType =
        await feeTypeRepository.findFeeTypeById(id);

    if (!feeType) {
        throw new Error("Fee type not found.");
    }

    // Validate Code
    if (data.code) {
        const existingCode =
            await feeTypeRepository.findFeeTypeByCode(
                data.code
            );

        if (
            existingCode &&
            existingCode.id !== Number(id)
        ) {
            throw new Error(
                "Fee type code already exists."
            );
        }
    }

    // Validate Name
    if (data.name) {
        const existingName =
            await feeTypeRepository.findFeeTypeByName(
                data.name
            );

        if (
            existingName &&
            existingName.id !== Number(id)
        ) {
            throw new Error(
                "Fee type name already exists."
            );
        }
    }

    return await feeTypeRepository.updateFeeType(
        id,
        data
    );
};

const deleteFeeType = async(id) => {
    const feeType =
        await feeTypeRepository.findFeeTypeById(id);

    if (!feeType) {
        throw new Error("Fee type not found.");
    }

    // Prevent deletion if in use
    if (
        feeType.feeStructures &&
        feeType.feeStructures.length > 0
    ) {
        throw new Error(
            "Cannot delete fee type because it is already assigned to one or more fee structures."
        );
    }

    return await feeTypeRepository.deleteFeeType(id);
};

module.exports = {
    getFeeTypes,
    getFeeTypeById,
    searchFeeTypes,
    createFeeType,
    updateFeeType,
    deleteFeeType,
};