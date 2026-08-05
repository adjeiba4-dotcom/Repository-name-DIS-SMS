// controllers/settings.controller.js — Global Configuration

const settingsService = require("../services/settings.service");
const ApiResponse = require("../utils/response");

function actorFrom(req) {
  return {
    userId: req.user?.id,
    ipAddress: req.ip,
    userAgent: req.get?.("user-agent") || null,
  };
}

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings(req.query);
    return ApiResponse.success(
      res,
      "Configuration retrieved successfully.",
      settings
    );
  } catch (error) {
    next(error);
  }
};

exports.getConfigMap = async (req, res, next) => {
  try {
    const result = await settingsService.getConfigMap(req.query);
    return ApiResponse.success(
      res,
      "Configuration map retrieved successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};

exports.getSettingById = async (req, res, next) => {
  try {
    const setting = await settingsService.getSettingById(Number(req.params.id));
    return ApiResponse.success(res, "Setting retrieved successfully.", setting);
  } catch (error) {
    next(error);
  }
};

exports.getSettingByKey = async (req, res, next) => {
  try {
    const setting = await settingsService.getSettingByKey(req.params.key);
    return ApiResponse.success(res, "Setting retrieved successfully.", setting);
  } catch (error) {
    next(error);
  }
};

exports.createSetting = async (req, res, next) => {
  try {
    const setting = await settingsService.createSetting(req.body, actorFrom(req));
    return ApiResponse.created(res, "Setting created successfully.", setting);
  } catch (error) {
    next(error);
  }
};

exports.updateSetting = async (req, res, next) => {
  try {
    const setting = await settingsService.updateSetting(
      Number(req.params.id),
      req.body,
      actorFrom(req)
    );
    return ApiResponse.success(res, "Setting updated successfully.", setting);
  } catch (error) {
    next(error);
  }
};

exports.upsertSettings = async (req, res, next) => {
  try {
    const entries = Array.isArray(req.body) ? req.body : req.body?.settings;
    const settings = await settingsService.upsertMany(entries, actorFrom(req));
    return ApiResponse.success(
      res,
      "Configuration updated successfully.",
      settings
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteSetting = async (req, res, next) => {
  try {
    const result = await settingsService.deleteSetting(
      Number(req.params.id),
      actorFrom(req)
    );
    return ApiResponse.success(res, "Setting deleted successfully.", result);
  } catch (error) {
    next(error);
  }
};
