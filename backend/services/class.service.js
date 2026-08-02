const classRepository = require("../repositories/class.repository");

/**
 * Get all active classes
 */
exports.getClasses = async() => {
    return await classRepository.findAllClasses();
};

/**
 * Get class by ID
 */
exports.getClassById = async(id) => {
    const schoolClass = await classRepository.findClassById(id);

    if (!schoolClass) {
        throw new Error("Class not found.");
    }

    return schoolClass;
};

/**
 * Search classes
 */
exports.searchClasses = async(keyword) => {
    return await classRepository.searchClasses(keyword);
};

/**
 * Get archived classes
 */
exports.getArchivedClasses = async() => {
    return await classRepository.findArchivedClasses();
};

/**
 * Create class
 */
exports.createClass = async(data) => {
    const existingCode = await classRepository.findClassByCode(data.code);

    if (existingCode) {
        throw new Error("Class code already exists.");
    }

    // Optional duplicate name check
    if (data.name) {
        const existingName = await classRepository.findClassByName(data.name);

        if (existingName) {
            throw new Error("Class name already exists.");
        }
    }

    return await classRepository.createClass(data);
};

/**
 * Update class
 */
exports.updateClass = async(id, data) => {
    const schoolClass = await classRepository.findClassById(id);

    if (!schoolClass) {
        throw new Error("Class not found.");
    }

    if (data.code && data.code !== schoolClass.code) {
        const existingCode = await classRepository.findClassByCode(data.code);

        if (existingCode) {
            throw new Error("Class code already exists.");
        }
    }

    if (data.name && data.name !== schoolClass.name) {
        const existingName = await classRepository.findClassByName(data.name);

        if (existingName) {
            throw new Error("Class name already exists.");
        }
    }

    return await classRepository.updateClass(id, data);
};

/**
 * Archive class
 */
exports.deleteClass = async(id) => {
    const schoolClass = await classRepository.findClassById(id);

    if (!schoolClass) {
        throw new Error("Class not found.");
    }

    return await classRepository.softDeleteClass(id);
};

/**
 * Restore archived class
 */
exports.restoreClass = async(id) => {
    const archivedClasses = await classRepository.findArchivedClasses();

    const schoolClass = archivedClasses.find(
        (item) => item.id === id
    );

    if (!schoolClass) {
        throw new Error("Archived class not found.");
    }

    if (schoolClass.deletedAt === null) {
        throw new Error("Class is already active.");
    }

    return await classRepository.restoreClass(id);
};