const guardianRepository = require("../repositories/guardian.repository");

const {
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all active guardians
 */
const getGuardians = async() => {
    return await guardianRepository.findAllGuardians();
};

/**
 * Get guardian by ID
 */
const getGuardianById = async(id) => {
    const guardian =
        await guardianRepository.findGuardianById(
            Number(id)
        );

    if (!guardian || guardian.deletedAt) {
        throw new NotFoundError(
            "Guardian not found."
        );
    }

    return guardian;
};

/**
 * Search guardians
 */
const searchGuardians = async(keyword) => {
    return await guardianRepository.searchGuardians(
        keyword || ""
    );
};

/**
 * Get archived guardians
 */
const getArchivedGuardians = async() => {
    return await guardianRepository.findArchivedGuardians();
};

/**
 * Create guardian
 */
const createGuardian = async(guardianData) => {

    if (guardianData.email) {

        const existingGuardian =
            await guardianRepository.findGuardianByEmail(
                guardianData.email
            );

        if (existingGuardian) {
            throw new ConflictError(
                "A guardian with this email already exists."
            );
        }
    }

    return await guardianRepository.createGuardian(
        guardianData
    );
};

/**
 * Update guardian
 */
const updateGuardian = async(
    id,
    guardianData
) => {

    const guardian =
        await guardianRepository.findGuardianById(
            Number(id)
        );

    if (!guardian || guardian.deletedAt) {
        throw new NotFoundError(
            "Guardian not found."
        );
    }

    if (
        guardianData.email &&
        guardianData.email !== guardian.email
    ) {

        const existingGuardian =
            await guardianRepository.findGuardianByEmail(
                guardianData.email
            );

        if (
            existingGuardian &&
            existingGuardian.id !== Number(id)
        ) {
            throw new ConflictError(
                "Another guardian already uses this email."
            );
        }
    }

    return await guardianRepository.updateGuardian(
        Number(id),
        guardianData
    );
};

/**
 * Archive guardian
 */
const deleteGuardian = async(id) => {

    const guardian =
        await guardianRepository.findGuardianById(
            Number(id)
        );

    if (!guardian || guardian.deletedAt) {
        throw new NotFoundError(
            "Guardian not found."
        );
    }

    return await guardianRepository.softDeleteGuardian(
        Number(id)
    );
};

/**
 * Restore guardian
 */
const restoreGuardian = async(id) => {

    const guardian =
        await guardianRepository.findGuardianById(
            Number(id)
        );

    if (!guardian) {
        throw new NotFoundError(
            "Guardian not found."
        );
    }

    if (!guardian.deletedAt) {
        throw new ConflictError(
            "Guardian is already active."
        );
    }

    return await guardianRepository.restoreGuardian(
        Number(id)
    );
};

module.exports = {
    getGuardians,
    getGuardianById,
    searchGuardians,
    getArchivedGuardians,
    createGuardian,
    updateGuardian,
    deleteGuardian,
    restoreGuardian,
};