-- Sprint 6.2: Terms module — code, description, unique code per academic year

ALTER TABLE `terms` ADD COLUMN `code` VARCHAR(191) NULL;
ALTER TABLE `terms` ADD COLUMN `description` TEXT NULL;

UPDATE `terms`
SET `code` = CONCAT('TERM-', `id`)
WHERE `code` IS NULL OR `code` = '';

ALTER TABLE `terms` MODIFY COLUMN `code` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `terms_academicYearId_code_key` ON `terms`(`academicYearId`, `code`);
CREATE INDEX `terms_code_idx` ON `terms`(`code`);
