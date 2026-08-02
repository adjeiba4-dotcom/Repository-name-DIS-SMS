// services/settings.service.js

const settingsRepository = require("../repositories/settings.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all settings
 */
const getSettings = async() => {
    return await settingsRepository.findAllSettings();
};

/**
 * Get setting by ID
 */
const getSettingById = async(id) => {

    const setting =
        await settingsRepository.findSettingById(
            Number(id)
        );

    if (!setting) {
        throw new NotFoundError(
            "Setting not found."
        );
    }

    return setting;
};

/**
 * Search settings
 */
const searchSettings = async(keyword) => {
    return await settingsRepository.searchSettings(
        keyword || ""
    );
};

/**
 * Create setting
 */
const createSetting = async(data) => {

    if (!data.settingKey ||
        data.settingKey.trim() === ""
    ) {
        throw new BadRequestError(
            "Setting key is required."
        );
    }

    if (!data.settingValue ||
        data.settingValue.toString().trim() === ""
    ) {
        throw new BadRequestError(
            "Setting value is required."
        );
    }

    const existingSetting =
        await settingsRepository.findSettingByKey(
            data.settingKey.trim()
        );

    if (existingSetting) {
        throw new ConflictError(
            "A setting with this key already exists."
        );
    }

    return await settingsRepository.createSetting({
        settingKey: data.settingKey.trim(),
        settingValue: data.settingValue,
        description: data.description || null,
    });
};

/**
 * Update setting
 */
const updateSetting = async(
    id,
    data
) => {

    const setting =
        await settingsRepository.findSettingById(
            Number(id)
        );

    if (!setting) {
        throw new NotFoundError(
            "Setting not found."
        );
    }

    if (
        data.settingKey &&
        data.settingKey !== setting.settingKey
    ) {
        const duplicate =
            await settingsRepository.findSettingByKey(
                data.settingKey.trim()
            );

        if (duplicate) {
            throw new ConflictError(
                "A setting with this key already exists."
            );
        }
    }

    return await settingsRepository.updateSetting(
        Number(id), {
            settingKey: data.settingKey !== undefined ?
                data.settingKey.trim() :
                setting.settingKey,

            settingValue: data.settingValue !== undefined ?
                data.settingValue :
                setting.settingValue,

            description: data.description !== undefined ?
                data.description :
                setting.description,
        }
    );
};

/**
 * Delete setting
 */
const deleteSetting = async(
    id
) => {

    const setting =
        await settingsRepository.findSettingById(
            Number(id)
        );

    if (!setting) {
        throw new NotFoundError(
            "Setting not found."
        );
    }

    return await settingsRepository.deleteSetting(
        Number(id)
    );
};

module.exports = {
    getSettings,
    getSettingById,
    searchSettings,
    createSetting,
    updateSetting,
    deleteSetting,
};