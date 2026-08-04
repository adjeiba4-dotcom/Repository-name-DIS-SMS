-- =============================================================================
-- DIS-SMS Batch 2.5A CONTINUE — System Core (remaining statements only)
--
-- Context:
--   20260803120000_batch25a_system_core failed at Query #28 (MySQL 1830):
--   notifications.userId cannot be NOT NULL while notifications_userId_fkey
--   uses ON DELETE SET NULL.
--
-- Live verification (read-only): Queries #1–#27 ARE applied.
-- This file contains ONLY statements that are NOT yet reflected in MySQL.
--
-- Does NOT re-run:
--   column ADDs, CREATE TABLE messages, completed MODIFYs, completed indexes,
--   system_backups_* / system_logs_* / announcements_* constraints already present
--
-- Strategy for remaining work: Backfill (safe re-run) → Constrain
-- Forbidden: DROP TABLE, DROP COLUMN, DELETE, destructive RENAME
-- =============================================================================

-- #############################################################################
-- PHASE 2 (remaining) — BACKFILL
-- Re-apply only for columns still nullable after the failed constrain step.
-- Empty tables today → no row rewrites at scale; COALESCE keeps it idempotent.
-- #############################################################################

-- -----------------------------------------------------------------------------
-- B1) notifications — ensure isRead / updatedAt populated before NOT NULL
-- WHY: Expand columns exist but Constrain (#28) never ran; still nullable.
-- WHAT: isRead ← readAt IS NOT NULL; updatedAt ← createdAt.
-- SAFE: COALESCE-only; no deletes; 0 rows.
-- -----------------------------------------------------------------------------
UPDATE `notifications`
SET
  `isRead` = COALESCE(`isRead`, CASE WHEN `readAt` IS NOT NULL THEN true ELSE false END),
  `updatedAt` = COALESCE(`updatedAt`, `createdAt`, CURRENT_TIMESTAMP(3))
WHERE
  `isRead` IS NULL
  OR `updatedAt` IS NULL;

-- -----------------------------------------------------------------------------
-- B2) events — ensure organizedById / venue populated before NOT NULL
-- WHY: Expand columns exist; Constrain never reached; still nullable.
-- WHAT: organizedById ← organizerId; venue ← location.
-- SAFE: COALESCE-only; organizerId already FK → users; 0 rows.
-- -----------------------------------------------------------------------------
UPDATE `events`
SET
  `venue` = COALESCE(`venue`, `location`),
  `organizedById` = COALESCE(`organizedById`, `organizerId`)
WHERE
  `venue` IS NULL
  OR `organizedById` IS NULL;

-- -----------------------------------------------------------------------------
-- B3) email_logs — ensure message populated before NOT NULL
-- WHY: message column added; Constrain never reached; still nullable.
-- WHAT: message ← body.
-- SAFE: COALESCE-only; body retained; 0 rows.
-- -----------------------------------------------------------------------------
UPDATE `email_logs`
SET `message` = COALESCE(`message`, `body`)
WHERE `message` IS NULL;

-- #############################################################################
-- PHASE 3 (remaining) — CONSTRAIN
-- #############################################################################

-- -----------------------------------------------------------------------------
-- C1) notifications — fix MySQL 1830, then constrain + indexes
-- WHY: Live FK notifications_userId_fkey is ON DELETE SET NULL, which blocks
--      userId NOT NULL. Prisma requires userId Int + onDelete: Cascade.
-- WHAT:
--   1) DROP FOREIGN KEY notifications_userId_fkey (metadata only)
--   2) MODIFY userId / isRead / updatedAt NOT NULL
--   3) ADD FK notifications_userId_fkey ON DELETE CASCADE
--   4) CREATE status/type indexes (absent on live)
-- SAFE: No column/table/data drops; matches schema.prisma; empty table.
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
-- C2) events — constrain organizedById + Prisma indexes + FK
-- WHY: Remaining after #28 failure; organizedById still nullable; indexes/FK absent.
-- WHAT: NOT NULL; create organizedById/startDate/status indexes; ADD FK.
-- SAFE: Backfilled from organizerId; does not touch organizerId legacy column.
-- NOTE: events_organizerId_idx already exists — do NOT recreate it.
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
-- C3) messages — add sender/receiver FKs
-- WHY: Table + indexes exist from Query #6; FKs were never added (#36 pending).
-- WHAT: ADD messages_senderId_fkey / messages_receiverId_fkey CASCADE.
-- SAFE: Empty table; indexes already present — not recreated.
-- -----------------------------------------------------------------------------
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_senderId_fkey`
    FOREIGN KEY (`senderId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `messages_receiverId_fkey`
    FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- C4) sms_logs — Prisma indexes only
-- WHY: providerReference already added (#7); indexes missing.
-- WHAT: CREATE status + recipient indexes.
-- SAFE: Additive indexes only.
-- -----------------------------------------------------------------------------
CREATE INDEX `sms_logs_status_idx` ON `sms_logs`(`status`);
CREATE INDEX `sms_logs_recipient_idx` ON `sms_logs`(`recipient`);

-- -----------------------------------------------------------------------------
-- C5) email_logs — constrain message + Prisma indexes
-- WHY: message/providerReference added (#8); NOT NULL + indexes pending.
-- WHAT: message NOT NULL; CREATE status + recipient indexes.
-- SAFE: Backfilled from body; body retained.
-- -----------------------------------------------------------------------------
ALTER TABLE `email_logs`
  MODIFY COLUMN `message` TEXT NOT NULL;

CREATE INDEX `email_logs_status_idx` ON `email_logs`(`status`);
CREATE INDEX `email_logs_recipient_idx` ON `email_logs`(`recipient`);

-- =============================================================================
-- Intentionally omitted (already applied on live DB — do not duplicate):
--   Q1–Q8  Expand ADDs / CREATE TABLE messages
--   Q9–Q14 Backfills whose targets are already constrained (except B1–B3 above)
--   Q15–Q18 system_backups MODIFY + indexes + createdById FK
--   Q19–Q22 system_logs MODIFY + indexes
--   Q23–Q27 announcements MODIFY + indexes + publishedById FK
-- =============================================================================
