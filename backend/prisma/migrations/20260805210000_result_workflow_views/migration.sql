-- Sprint 7.5+ — Results Engine workflow + verified stage

ALTER TABLE `results`
    ADD COLUMN `workflowStatus` ENUM('DRAFT', 'GENERATED', 'VERIFIED', 'PUBLISHED', 'LOCKED') NOT NULL DEFAULT 'GENERATED',
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verifiedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedById` INTEGER NULL;

-- Backfill existing rows from publish/lock flags.
UPDATE `results`
SET
    `workflowStatus` = CASE
        WHEN `isLocked` = true THEN 'LOCKED'
        WHEN `isPublished` = true THEN 'PUBLISHED'
        ELSE 'GENERATED'
    END,
    `isVerified` = CASE
        WHEN `isPublished` = true OR `isLocked` = true THEN true
        ELSE false
    END,
    `verifiedAt` = CASE
        WHEN `isPublished` = true OR `isLocked` = true THEN COALESCE(`publishedAt`, `lockedAt`, NOW(3))
        ELSE NULL
    END;

CREATE INDEX `results_workflowStatus_idx` ON `results`(`workflowStatus`);
CREATE INDEX `results_isVerified_idx` ON `results`(`isVerified`);
CREATE INDEX `results_verifiedById_idx` ON `results`(`verifiedById`);

ALTER TABLE `results`
    ADD CONSTRAINT `results_verifiedById_fkey`
    FOREIGN KEY (`verifiedById`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
