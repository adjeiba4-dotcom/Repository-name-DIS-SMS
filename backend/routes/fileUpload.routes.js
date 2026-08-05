// routes/fileUpload.routes.js

const express = require("express");
const router = express.Router();

const fileUploadController = require("../controllers/fileUpload.controller");
const { uploadAny } = require("../middleware/upload.middleware");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const ROLES = require("../constants/roles");

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Shared file upload service for logos, photos, and documents
 */

router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMINISTRATOR, ROLES.HEADMASTER, ROLES.REGISTRAR),
  fileUploadController.listFiles
);

router.get(
  "/:id",
  authenticate,
  authorize(ROLES.ADMINISTRATOR, ROLES.HEADMASTER, ROLES.REGISTRAR),
  fileUploadController.getFileById
);

router.post(
  "/",
  authenticate,
  authorize(
    ROLES.ADMINISTRATOR,
    ROLES.HEADMASTER,
    ROLES.REGISTRAR,
    ROLES.TEACHER
  ),
  uploadAny.single("file"),
  fileUploadController.uploadFile
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMINISTRATOR),
  fileUploadController.deleteFile
);

module.exports = router;
