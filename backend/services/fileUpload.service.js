// services/fileUpload.service.js — shared logos/photos/documents upload

const fs = require("fs");
const path = require("path");
const fileAssetRepository = require("../repositories/fileAsset.repository");
const auditService = require("./audit.service");
const { BadRequestError, NotFoundError } = require("../errors");

const UPLOAD_ROOT = path.join(__dirname, "..", "public", "uploads");

const CATEGORY_DIRS = {
  LOGO: "logos",
  PHOTO: "photos",
  DOCUMENT: "documents",
  OTHER: "other",
};

const CATEGORY_MIME = {
  LOGO: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"],
  PHOTO: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
  ],
  OTHER: null,
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function assertCategory(category) {
  const value = String(category || "OTHER").toUpperCase();
  if (!CATEGORY_DIRS[value]) {
    throw new BadRequestError(
      `Invalid file category. Allowed: ${Object.keys(CATEGORY_DIRS).join(", ")}.`
    );
  }
  return value;
}

class FileUploadService {
  getUploadRoot() {
    ensureDir(UPLOAD_ROOT);
    return UPLOAD_ROOT;
  }

  getCategoryDir(category) {
    const normalized = assertCategory(category);
    const dir = path.join(UPLOAD_ROOT, CATEGORY_DIRS[normalized]);
    ensureDir(dir);
    return { category: normalized, dir, relative: CATEGORY_DIRS[normalized] };
  }

  assertMimeType(category, mimeType) {
    const allowed = CATEGORY_MIME[category];
    if (allowed && !allowed.includes(mimeType)) {
      throw new BadRequestError(
        `Unsupported file type for ${category}. Received ${mimeType}.`
      );
    }
  }

  buildPublicUrl(relativePath) {
    const base = (process.env.API_PUBLIC_URL || "").replace(/\/$/, "");
    const urlPath = `/uploads/${relativePath.replace(/\\/g, "/")}`;
    return base ? `${base}${urlPath}` : urlPath;
  }

  async saveUploadedFile(file, options = {}, actor = {}) {
    if (!file) {
      throw new BadRequestError("No file uploaded.");
    }

    const { category, relative } = this.getCategoryDir(options.category);
    this.assertMimeType(category, file.mimetype);

    const relativePath = path.join(relative, file.filename);
    const publicUrl = this.buildPublicUrl(relativePath);

    const asset = await fileAssetRepository.create({
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      category,
      path: relativePath.replace(/\\/g, "/"),
      url: publicUrl,
      uploadedById: actor.userId ? Number(actor.userId) : null,
      entityType: options.entityType || null,
      entityId: options.entityId != null ? Number(options.entityId) : null,
    });

    await auditService.recordSafe({
      userId: actor.userId,
      module: "FileUpload",
      action: "UPLOAD",
      entityType: "FileAsset",
      recordId: asset.id,
      description: `Uploaded ${category.toLowerCase()} file ${asset.originalName}`,
      newValues: asset,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return asset;
  }

  async getFileById(id) {
    const file = await fileAssetRepository.findById(id);
    if (!file) {
      throw new NotFoundError("File not found.");
    }
    return file;
  }

  async listFiles(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const category = query.category
      ? assertCategory(query.category)
      : null;

    return fileAssetRepository.list({
      page,
      limit,
      category,
      entityType: query.entityType || null,
      entityId: query.entityId || null,
    });
  }

  async deleteFile(id, actor = {}) {
    const file = await this.getFileById(id);
    const absolute = path.join(UPLOAD_ROOT, file.path);

    const deleted = await fileAssetRepository.softDelete(id);

    if (fs.existsSync(absolute)) {
      try {
        fs.unlinkSync(absolute);
      } catch (error) {
        console.error("[fileUpload] Failed to remove file from disk:", error.message);
      }
    }

    await auditService.recordSafe({
      userId: actor.userId,
      module: "FileUpload",
      action: "DELETE",
      entityType: "FileAsset",
      recordId: deleted.id,
      description: `Deleted file ${deleted.originalName}`,
      oldValues: file,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { id: Number(id) };
  }
}

module.exports = new FileUploadService();
