// controllers/settings.controller.js

const settingsService = require("../services/settings.service");
const ApiResponse = require("../utils/response");

/**
 * Get all settings
 */
const getSettings = async(req, res, next) => {
    try {
        const settings =
            await settingsService.getSettings();

        return ApiResponse.success(
            res,
            "Settings retrieved successfully.",
            settings
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Get setting by ID
 */
const getSettingById = async(req, res, next) => {
    try {
        const setting =
            await settingsService.getSettingById(
                Number(req.params.id)
            );

        return ApiResponse.success(
            res,
            "Setting retrieved successfully.",
            setting
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Search settings
 */
const searchSettings = async(req, res, next) => {
    try {
        const settings =
            await settingsService.searchSettings(
                req.query.keyword || ""
            );

        return ApiResponse.success(
            res,
            "Settings retrieved successfully.",
            settings
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Create setting
 */
const createSetting = async(req, res, next) => {
    try {
        const setting =
            await settingsService.createSetting(
                req.body
            );

        return ApiResponse.created(
            res,
            "Setting created successfully.",
            setting
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Update setting
 */
const updateSetting = async(req, res, next) => {
    try {
        const setting =
            await settingsService.updateSetting(
                Number(req.params.id),
                req.body
            );

        return ApiResponse.success(
            res,
            "Setting updated successfully.",
            setting
        );
    } catch (error) {
        next(error);
    }
};

/**
 * Delete setting
 */
const deleteSetting = async(req, res, next) => {
    try {
        await settingsService.deleteSetting(
            Number(req.params.id)
        );

        return ApiResponse.success(
            res,
            "Setting deleted successfully."
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSettings,
    getSettingById,
    searchSettings,
    createSetting,
    updateSetting,
    deleteSetting,
};