-- =============================================================================
-- DIS-SMS Batch 1 — Authentication & Identity (ADDITIVE ONLY)
-- Strategy: Expand → (no backfill required) → Constrain (safe FKs on empty tables)
-- Forbidden in this file: DROP TABLE, DROP COLUMN, destructive RENAME, data deletes
-- Scope: Auth only. Does NOT touch Academic, Finance, Library, Inventory,
--        Transport, Hostel, or Assets.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Widen audit_logs.description VARCHAR(191) → TEXT
--    Reason: Prisma maps description to @db.Text; longer audit payloads must not
--    truncate. MODIFY to TEXT is non-lossy (widening only); nullability preserved.
-- -----------------------------------------------------------------------------
ALTER TABLE `audit_logs`
  MODIFY COLUMN `description` TEXT NULL;

-- -----------------------------------------------------------------------------
-- 2) Widen system_settings.settingValue VARCHAR(191) → TEXT
--    Reason: Prisma maps settingValue to @db.Text; settings (JSON/HTML) may exceed
--    191 chars. MODIFY to TEXT is non-lossy; NOT NULL preserved (no DEFAULT change).
-- -----------------------------------------------------------------------------
ALTER TABLE `system_settings`
  MODIFY COLUMN `settingValue` TEXT NOT NULL;

-- -----------------------------------------------------------------------------
-- 3) Add missing indexes on existing auth tables (Prisma @@index alignment).
--    Additive only; no column/data changes. Verified absent on live MySQL.
-- -----------------------------------------------------------------------------
CREATE INDEX `roles_status_idx` ON `roles`(`status`);

CREATE INDEX `permissions_module_idx` ON `permissions`(`module`);

CREATE INDEX `users_status_idx` ON `users`(`status`);

CREATE INDEX `audit_logs_module_idx` ON `audit_logs`(`module`);

CREATE INDEX `audit_logs_action_idx` ON `audit_logs`(`action`);

CREATE INDEX `audit_logs_createdAt_idx` ON `audit_logs`(`createdAt`);

-- -----------------------------------------------------------------------------
-- 4) CREATE login_history (greenfield — missing in MySQL, required by User relation)
--    Starts empty; preserves all existing users/roles data.
-- -----------------------------------------------------------------------------
CREATE TABLE `login_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `loginTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `logoutTime` DATETIME(3) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_history_userId_idx`(`userId`),
    INDEX `login_history_loginTime_idx`(`loginTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5) FK login_history.userId → users.id (ON DELETE CASCADE)
--    Safe: table is empty at create time → no orphan risk.
-- -----------------------------------------------------------------------------
ALTER TABLE `login_history`
  ADD CONSTRAINT `login_history_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- 6) CREATE password_reset_tokens (greenfield — email/token based, no User FK)
-- -----------------------------------------------------------------------------
CREATE TABLE `password_reset_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_key`(`token`),
    INDEX `password_reset_tokens_email_idx`(`email`),
    INDEX `password_reset_tokens_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7) CREATE api_keys (greenfield — no User FK in schema)
-- -----------------------------------------------------------------------------
CREATE TABLE `api_keys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `apiKey` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `expiresAt` DATETIME(3) NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `api_keys_apiKey_key`(`apiKey`),
    INDEX `api_keys_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
