-- =============================================================================
-- DIS-SMS Batch 2.5A — System Core Alignment (ADDITIVE ONLY)
-- Strategy: Expand → Backfill → Constrain  |  Contract deferred
--
-- Scope (ONLY):
--   system_backups, system_logs, announcements, notifications, events,
--   messages, sms_logs, email_logs
--
-- Explicitly OUT OF SCOPE:
--   dashboards, dashboard_widgets, reports, report_executions,
--   Finance, Academic, Library, Inventory, Transport, Hostel, Assets, Auth
--
-- Forbidden: DROP TABLE, DROP COLUMN, DELETE, destructive RENAME,
--            prisma db push, migrate reset
--
-- CRITICAL Studio fix:
--   Live system_backups.createdBy exists; Prisma requires createdById.
--   Dual-write: ADD createdById, backfill from createdBy, keep createdBy.
--
-- Pre-migration: all in-scope tables empty (0 rows) except messages (missing).
-- =============================================================================

-- #############################################################################
-- PHASE 1 — EXPAND
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 1.1) system_backups — add Prisma createdById + missing fields
-- WHY: Prisma Studio fails: "system_backups.createdById does not exist".
--      Schema also requires backupDate, remarks, updatedAt.
-- WHAT: ADD createdById, backupDate, remarks, updatedAt (nullable first).
-- SAFE: Additive only; preserves createdBy + backupType; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `system_backups`
  ADD COLUMN `createdById` INT NULL,
  ADD COLUMN `backupDate` DATETIME(3) NULL,
  ADD COLUMN `remarks` TEXT NULL,
  ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- -----------------------------------------------------------------------------
-- 1.2) system_logs — add Prisma logLevel + createdAt
-- WHY: Schema uses logLevel/createdAt; live uses level/loggedAt.
-- WHAT: ADD logLevel, createdAt. Preserve level, action, userAgent, loggedAt.
-- SAFE: Additive dual-write columns; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `system_logs`
  ADD COLUMN `logLevel` VARCHAR(191) NULL,
  ADD COLUMN `createdAt` DATETIME(3) NULL;

-- -----------------------------------------------------------------------------
-- 1.3) announcements — add content / publishedById / isPublished / deletedAt
-- WHY: Prisma Announcement requires these; live has message/createdBy.
-- WHAT: ADD four columns. Preserve message, createdBy.
-- SAFE: Additive; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `announcements`
  ADD COLUMN `content` TEXT NULL,
  ADD COLUMN `publishedById` INT NULL,
  ADD COLUMN `isPublished` BOOLEAN NULL,
  ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- -----------------------------------------------------------------------------
-- 1.4) notifications — add isRead + updatedAt
-- WHY: Prisma Notification requires isRead and updatedAt.
-- WHAT: ADD both. Preserve announcementId, sentAt, studentId.
-- SAFE: Additive; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `notifications`
  ADD COLUMN `isRead` BOOLEAN NULL,
  ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- -----------------------------------------------------------------------------
-- 1.5) events — add venue + organizedById
-- WHY: Schema Event uses venue/organizedById; live has location/organizerId.
-- WHAT: ADD venue, organizedById. Preserve location, organizerId.
-- SAFE: Additive dual-write; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `events`
  ADD COLUMN `venue` VARCHAR(191) NULL,
  ADD COLUMN `organizedById` INT NULL;

-- -----------------------------------------------------------------------------
-- 1.6) messages — create missing table
-- WHY: Prisma Message @@map("messages") has no live table.
-- WHAT: CREATE TABLE messages with Prisma columns + indexes.
-- SAFE: Greenfield CREATE only; no existing data affected.
-- -----------------------------------------------------------------------------
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `senderId` INTEGER NOT NULL,
    `receiverId` INTEGER NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `messages_senderId_idx`(`senderId`),
    INDEX `messages_receiverId_idx`(`receiverId`),
    INDEX `messages_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 1.7) sms_logs — add providerReference
-- WHY: Prisma SmsLog.providerReference missing.
-- WHAT: ADD nullable providerReference. Preserve response.
-- SAFE: Additive optional column; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `sms_logs`
  ADD COLUMN `providerReference` VARCHAR(191) NULL;

-- -----------------------------------------------------------------------------
-- 1.8) email_logs — add message + providerReference
-- WHY: Schema uses message; live stores body. providerReference missing.
-- WHAT: ADD message, providerReference. Preserve body, response.
-- SAFE: Additive; message backfilled from body; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `email_logs`
  ADD COLUMN `message` TEXT NULL,
  ADD COLUMN `providerReference` VARCHAR(191) NULL;

-- #############################################################################
-- PHASE 2 — BACKFILL
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 2.1) system_backups — createdBy → createdById (Studio relation repair)
-- WHY: Restore SystemBackup.createdBy / User.systemBackups without dropping createdBy.
-- WHAT: createdById ← createdBy; backupDate/updatedAt ← createdAt.
-- SAFE: createdBy already FK → users; 0 orphans; 0 rows.
-- -----------------------------------------------------------------------------
UPDATE `system_backups`
SET
  `createdById` = COALESCE(`createdById`, `createdBy`),
  `backupDate` = COALESCE(`backupDate`, `createdAt`, CURRENT_TIMESTAMP(3)),
  `updatedAt` = COALESCE(`updatedAt`, `createdAt`, CURRENT_TIMESTAMP(3))
WHERE
  `createdById` IS NULL
  OR `backupDate` IS NULL
  OR `updatedAt` IS NULL;

-- -----------------------------------------------------------------------------
-- 2.2) system_logs — level/loggedAt → logLevel/createdAt
-- WHY: Satisfy Prisma column names while preserving legacy columns.
-- WHAT: logLevel ← level; createdAt ← loggedAt.
-- SAFE: Non-destructive copy; 0 rows.
-- -----------------------------------------------------------------------------
UPDATE `system_logs`
SET
  `logLevel` = COALESCE(`logLevel`, `level`),
  `createdAt` = COALESCE(`createdAt`, `loggedAt`, CURRENT_TIMESTAMP(3))
WHERE
  `logLevel` IS NULL
  OR `createdAt` IS NULL;

-- -----------------------------------------------------------------------------
-- 2.3) announcements — message/createdBy → content/publishedById
-- WHY: Align Announcement.publishedBy and content.
-- WHAT: content ← message; publishedById ← createdBy; isPublished ← true.
-- SAFE: createdBy already FK → users; 0 rows.
-- -----------------------------------------------------------------------------
UPDATE `announcements`
SET
  `content` = COALESCE(`content`, `message`),
  `publishedById` = COALESCE(`publishedById`, `createdBy`),
  `isPublished` = COALESCE(`isPublished`, true)
WHERE
  `content` IS NULL
  OR `publishedById` IS NULL
  OR `isPublished` IS NULL;

-- -----------------------------------------------------------------------------
-- 2.4) notifications — derive isRead; stamp updatedAt
-- WHY: Prisma requires isRead and updatedAt.
-- WHAT: isRead ← (readAt IS NOT NULL); updatedAt ← createdAt.
-- SAFE: Deterministic; 0 rows.
-- -----------------------------------------------------------------------------
UPDATE `notifications`
SET
  `isRead` = COALESCE(`isRead`, CASE WHEN `readAt` IS NOT NULL THEN true ELSE false END),
  `updatedAt` = COALESCE(`updatedAt`, `createdAt`, CURRENT_TIMESTAMP(3))
WHERE
  `isRead` IS NULL
  OR `updatedAt` IS NULL;

-- -----------------------------------------------------------------------------
-- 2.5) events — location/organizerId → venue/organizedById
-- WHY: Restore Event.organizedBy and venue.
-- WHAT: venue ← location; organizedById ← organizerId.
-- SAFE: organizerId already FK → users; 0 rows.
-- -----------------------------------------------------------------------------
UPDATE `events`
SET
  `venue` = COALESCE(`venue`, `location`),
  `organizedById` = COALESCE(`organizedById`, `organizerId`)
WHERE
  `venue` IS NULL
  OR `organizedById` IS NULL;

-- -----------------------------------------------------------------------------
-- 2.6) email_logs — body → message
-- WHY: Prisma EmailLog.message is required.
-- WHAT: message ← body.
-- SAFE: Non-destructive copy; body retained; 0 rows.
-- -----------------------------------------------------------------------------
UPDATE `email_logs`
SET `message` = COALESCE(`message`, `body`)
WHERE `message` IS NULL;

-- #############################################################################
-- PHASE 3 — CONSTRAIN
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 3.1) system_backups — NOT NULL + indexes + FK createdById → users.id
-- WHY: Prisma requires createdById/backupDate/updatedAt; Studio needs FK path.
-- WHAT: Constrain; add indexes; ADD system_backups_createdById_fkey.
-- SAFE: Backfilled from createdBy; legacy createdBy FK kept; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `system_backups`
  MODIFY COLUMN `createdById` INT NOT NULL,
  MODIFY COLUMN `backupDate` DATETIME(3) NOT NULL,
  MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL;

CREATE INDEX `system_backups_backupDate_idx` ON `system_backups`(`backupDate`);
CREATE INDEX `system_backups_createdById_idx` ON `system_backups`(`createdById`);

ALTER TABLE `system_backups`
  ADD CONSTRAINT `system_backups_createdById_fkey`
  FOREIGN KEY (`createdById`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- 3.2) system_logs — constrain + Prisma indexes
-- WHY: logLevel/createdAt required; @@index([module],[logLevel],[createdAt]).
-- WHAT: NOT NULL; create missing indexes (userId idx already present).
-- SAFE: Backfilled; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `system_logs`
  MODIFY COLUMN `logLevel` VARCHAR(191) NOT NULL,
  MODIFY COLUMN `createdAt` DATETIME(3) NOT NULL;

CREATE INDEX `system_logs_module_idx` ON `system_logs`(`module`);
CREATE INDEX `system_logs_logLevel_idx` ON `system_logs`(`logLevel`);
CREATE INDEX `system_logs_createdAt_idx` ON `system_logs`(`createdAt`);

-- -----------------------------------------------------------------------------
-- 3.3) announcements — constrain + publishedById FK/indexes
-- WHY: Restore Announcement.publishedBy; content/isPublished required.
-- WHAT: NOT NULL; indexes; FK publishedById → users.id.
-- SAFE: Backfilled from createdBy; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `announcements`
  MODIFY COLUMN `content` TEXT NOT NULL,
  MODIFY COLUMN `publishedById` INT NOT NULL,
  MODIFY COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX `announcements_publishedById_idx` ON `announcements`(`publishedById`);
CREATE INDEX `announcements_publishDate_idx` ON `announcements`(`publishDate`);
CREATE INDEX `announcements_status_idx` ON `announcements`(`status`);

ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_publishedById_fkey`
  FOREIGN KEY (`publishedById`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- 3.4) notifications — align FK delete rule, then constrain + indexes
-- WHY: Prior Query #28 failed with MySQL 1830:
--      Column 'userId' cannot be NOT NULL because notifications_userId_fkey
--      uses ON DELETE SET NULL (SET NULL requires a nullable column).
--      Prisma Notification requires:
--        userId Int (NOT NULL) + onDelete: Cascade
-- WHAT:
--   1) DROP only the incompatible FK metadata (not a column/table/data drop).
--   2) Constrain userId / isRead / updatedAt to Prisma nullability.
--   3) Recreate FK as notifications_userId_fkey with ON DELETE CASCADE.
--   4) Add status/type indexes. Keep announcementId/sentAt/studentId.
-- SAFE: No row deletes; no column drops; empty table; matches schema.prisma.
-- REJECTED alternatives:
--   • keep userId nullable → leaves Prisma required-field drift
--   • remove NOT NULL only → same drift; Studio/client expect required userId
-- -----------------------------------------------------------------------------
ALTER TABLE `notifications`
  DROP FOREIGN KEY `notifications_userId_fkey`;

ALTER TABLE `notifications`
  MODIFY COLUMN `userId` INT NOT NULL,
  MODIFY COLUMN `isRead` BOOLEAN NOT NULL DEFAULT false,
  MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL;

ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX `notifications_status_idx` ON `notifications`(`status`);
CREATE INDEX `notifications_type_idx` ON `notifications`(`type`);

-- -----------------------------------------------------------------------------
-- 3.5) events — constrain organizedById + FK/indexes
-- WHY: Restore Event.organizedBy relation.
-- WHAT: organizedById NOT NULL; index; FK → users.id.
-- SAFE: Backfilled from organizerId; 0 rows.
-- -----------------------------------------------------------------------------
ALTER TABLE `events`
  MODIFY COLUMN `organizedById` INT NOT NULL;

CREATE INDEX `events_organizedById_idx` ON `events`(`organizedById`);
CREATE INDEX `events_startDate_idx` ON `events`(`startDate`);
CREATE INDEX `events_status_idx` ON `events`(`status`);

ALTER TABLE `events`
  ADD CONSTRAINT `events_organizedById_fkey`
  FOREIGN KEY (`organizedById`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- 3.6) messages — FKs to users (Cascade per Prisma)
-- WHY: Message.sender / Message.receiver relations.
-- WHAT: ADD senderId/receiverId FKs → users.id ON DELETE CASCADE.
-- SAFE: Empty greenfield table.
-- -----------------------------------------------------------------------------
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_senderId_fkey`
    FOREIGN KEY (`senderId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `messages_receiverId_fkey`
    FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- 3.7) sms_logs / email_logs — indexes + email message NOT NULL
-- WHY: Prisma @@index; EmailLog.message required after backfill.
-- WHAT: Create indexes; constrain email_logs.message.
-- SAFE: Additive indexes; 0 rows.
-- -----------------------------------------------------------------------------
CREATE INDEX `sms_logs_status_idx` ON `sms_logs`(`status`);
CREATE INDEX `sms_logs_recipient_idx` ON `sms_logs`(`recipient`);

ALTER TABLE `email_logs`
  MODIFY COLUMN `message` TEXT NOT NULL;

CREATE INDEX `email_logs_status_idx` ON `email_logs`(`status`);
CREATE INDEX `email_logs_recipient_idx` ON `email_logs`(`recipient`);

-- #############################################################################
-- PHASE 4 — CONTRACT (DEFERRED — no DROP/RENAME in this batch)
-- Preserved legacy columns:
--   system_backups.createdBy, system_backups.backupType
--   system_logs.level, action, userAgent, loggedAt
--   announcements.createdBy, message
--   notifications.announcementId, sentAt, studentId
--   events.location, organizerId
--   sms_logs.response
--   email_logs.body, response
-- #############################################################################
