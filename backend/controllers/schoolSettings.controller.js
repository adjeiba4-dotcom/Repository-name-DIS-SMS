// controllers/schoolSettings.controller.js

const schoolSettingsService = require("../services/schoolSettings.service");
const ApiResponse = require("../utils/response");

function actorFrom(req) {
  return {
    userId: req.user?.id,
    ipAddress: req.ip,
    userAgent: req.get?.("user-agent") || null,
  };
}

exports.getSchoolSettings = async (req, res, next) => {
  try {
    const profile = await schoolSettingsService.getSchoolProfile();
    return ApiResponse.success(
      res,
      "School settings retrieved successfully.",
      profile
    );
  } catch (error) {
    next(error);
  }
};

exports.updateSchoolSettings = async (req, res, next) => {
  try {
    const profile = await schoolSettingsService.updateSchoolProfile(
      req.body,
      actorFrom(req)
    );
    return ApiResponse.success(
      res,
      "School settings updated successfully.",
      profile
    );
  } catch (error) {
    next(error);
  }
};
