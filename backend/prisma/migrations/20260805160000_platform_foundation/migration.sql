-- Sprint 6.8 — Platform Foundation & Architecture Freeze

ALTER TABLE `audit_logs`
  ADD COLUMN `entityType` VARCHAR(191) NULL,
  ADD COLUMN `oldValues` JSON NULL,
  ADD COLUMN `newValues` JSON NULL,
  ADD COLUMN `userAgent` VARCHAR(191) NULL;

CREATE INDEX `audit_logs_entityType_idx` ON `audit_logs`(`entityType`);

ALTER TABLE `system_settings`
  ADD COLUMN `category` VARCHAR(50) NULL,
  ADD COLUMN `dataType` VARCHAR(20) NOT NULL DEFAULT 'STRING',
  ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `system_settings_category_idx` ON `system_settings`(`category`);

ALTER TABLE `notifications`
  ADD COLUMN `channel` ENUM('IN_APP', 'EMAIL', 'SMS') NOT NULL DEFAULT 'IN_APP',
  ADD COLUMN `entityType` VARCHAR(191) NULL,
  ADD COLUMN `entityId` INTEGER NULL,
  ADD COLUMN `meta` JSON NULL;

CREATE INDEX `notifications_channel_idx` ON `notifications`(`channel`);
CREATE INDEX `notifications_isRead_idx` ON `notifications`(`isRead`);

CREATE TABLE `school_profiles` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `schoolName` VARCHAR(191) NOT NULL,
  `schoolCode` VARCHAR(191) NULL,
  `motto` VARCHAR(191) NULL,
  `address` TEXT NULL,
  `city` VARCHAR(191) NULL,
  `region` VARCHAR(191) NULL,
  `country` VARCHAR(191) NULL,
  `postalCode` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `logoUrl` VARCHAR(191) NULL,
  `stampUrl` VARCHAR(191) NULL,
  `establishedYear` INTEGER NULL,
  `accreditationInfo` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `school_profiles_schoolCode_key`(`schoolCode`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `file_assets` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `originalName` VARCHAR(191) NOT NULL,
  `storedName` VARCHAR(191) NOT NULL,
  `mimeType` VARCHAR(191) NOT NULL,
  `sizeBytes` INTEGER NOT NULL,
  `category` ENUM('LOGO', 'PHOTO', 'DOCUMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
  `path` VARCHAR(191) NOT NULL,
  `url` VARCHAR(191) NOT NULL,
  `uploadedById` INTEGER NULL,
  `entityType` VARCHAR(191) NULL,
  `entityId` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `deletedAt` DATETIME(3) NULL,
  INDEX `file_assets_category_idx`(`category`),
  INDEX `file_assets_uploadedById_idx`(`uploadedById`),
  INDEX `file_assets_entityType_entityId_idx`(`entityType`, `entityId`),
  INDEX `file_assets_deletedAt_idx`(`deletedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `file_assets`
  ADD CONSTRAINT `file_assets_uploadedById_fkey`
  FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
