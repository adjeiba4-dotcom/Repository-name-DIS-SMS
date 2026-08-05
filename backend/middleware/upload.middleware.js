// middleware/upload.middleware.js

const path = require("path");
const multer = require("multer");
const fileUploadService = require("../services/fileUpload.service");
const { BadRequestError } = require("../errors");

function buildStorage(category) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const resolvedCategory =
          (req.body && req.body.category) ||
          req.query.category ||
          category ||
          "OTHER";
        const { dir } = fileUploadService.getCategoryDir(resolvedCategory);
        req.uploadCategory = resolvedCategory.toUpperCase();
        cb(null, dir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safeBase = path
        .basename(file.originalname || "file", ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 40);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${safeBase || "file"}-${unique}${ext}`);
    },
  });
}

function createUploader({ category = "OTHER", maxSizeMb = 5 } = {}) {
  const upload = multer({
    storage: buildStorage(category),
    limits: { fileSize: maxSizeMb * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      try {
        const resolved =
          (req.body && req.body.category) ||
          req.query.category ||
          category ||
          "OTHER";
        fileUploadService.assertMimeType(
          String(resolved).toUpperCase(),
          file.mimetype
        );
        cb(null, true);
      } catch (error) {
        cb(error);
      }
    },
  });

  return {
    single: (fieldName = "file") => (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            return next(
              new BadRequestError(
                err.code === "LIMIT_FILE_SIZE"
                  ? `File exceeds the ${maxSizeMb}MB size limit.`
                  : err.message
              )
            );
          }
          return next(err);
        }
        return next();
      });
    },
  };
}

module.exports = {
  createUploader,
  uploadLogo: createUploader({ category: "LOGO", maxSizeMb: 2 }),
  uploadPhoto: createUploader({ category: "PHOTO", maxSizeMb: 5 }),
  uploadDocument: createUploader({ category: "DOCUMENT", maxSizeMb: 10 }),
  uploadAny: createUploader({ category: "OTHER", maxSizeMb: 10 }),
};
