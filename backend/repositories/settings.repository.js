// repositories/settings.repository.js

const prisma = require("../database/db");

/**
 * Get all settings
 */
const findAllSettings = async() => {
    return await prisma.setting.findMany({
        orderBy: {
            settingKey: "asc",
        },
    });
};

/**
 * Get setting by ID
 */
const findSettingById = async(id) => {
    return await prisma.setting.findUnique({
        where: {
            id: Number(id),
        },
    });
};

/**
 * Get setting by key
 */
const findSettingByKey = async(settingKey) => {
    return await prisma.setting.findUnique({
        where: {
            settingKey,
        },
    });
};

/**
 * Search settings
 */
const searchSettings = async(keyword) => {
    return await prisma.setting.findMany({
        where: {
            OR: [{
                    settingKey: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    settingValue: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
                {
                    description: {
                        contains: keyword,
                        mode: "insensitive",
                    },
                },
            ],
        },
        orderBy: {
            settingKey: "asc",
        },
    });
};

/**
 * Create setting
 */
const createSetting = async(data) => {
    return await prisma.setting.create({
        data,
    });
};

/**
 * Update setting
 */
const updateSetting = async(
    id,
    data
) => {
    return await prisma.setting.update({
        where: {
            id: Number(id),
        },
        data,
    });
};

/**
 * Delete setting
 */
const deleteSetting = async(id) => {
    return await prisma.setting.delete({
        where: {
            id: Number(id),
        },
    });
};

module.exports = {
    findAllSettings,
    findSettingById,
    findSettingByKey,
    searchSettings,
    createSetting,
    updateSetting,
    deleteSetting,
};