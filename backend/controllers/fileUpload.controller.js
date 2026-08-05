// controllers/fileUpload.controller.js

const fileUploadService = require("../services/fileUpload.service");
const ApiResponse = require("../utils/response");
const { BadRequestError } = require("../errors");

function actorFrom(req) {
  return {
    userId: req.user?.id,
    ipAddress: req.ip,
    userAgent: req.get?.("user-agent") || null,
  };
}

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError("File is required.");
    }

    const asset = await fileUploadService.saveUploadedFile(
      req.file,
      {
        category: req.uploadCategory || req.body.category || req.query.category,
        entityType: req.body.entityType || null,
        entityId: req.body.entityId || null,
      },
      actorFrom(req)
    );

    return ApiResponse.created(res, "File uploaded successfully.", asset);
  } catch (error) {
    next(error);
  }
};

exports.listFiles = async (req, res, next) => {
  try {
    const result = await fileUploadService.listFiles(req.query);
    return ApiResponse.paginated(
      res,
      "Files retrieved successfully.",
      result.data,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    );
  } catch (error) {
    next(error);
  }
};

exports.getFileById = async (req, res, next) => {
  try {
    const file = await fileUploadService.getFileById(Number(req.params.id));
    return ApiResponse.success(res, "File retrieved successfully.", file);
  } catch (error) {
    next(error);
  }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const result = await fileUploadService.deleteFile(
      Number(req.params.id),
      actorFrom(req)
    );
    return ApiResponse.success(res, "File deleted successfully.", result);
  } catch (error) {
    next(error);
  }
};
