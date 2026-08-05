-- Sprint 6.4: Subjects module — subjectCode/subjectName/shortName, nullable
-- department, CORE|ELECTIVE category, unique subjectName.

-- PHASE 1 — EXPAND
ALTER TABLE `subjects`
  ADD COLUMN `subjectCode` VARCHAR(191) NULL,
  ADD COLUMN `subjectName` VARCHAR(191) NULL,
  ADD COLUMN `shortName` VARCHAR(191) NULL,
  ADD COLUMN `category` ENUM('CORE', 'ELECTIVE') NOT NULL DEFAULT 'CORE';

-- PHASE 2 — BACKFILL
UPDATE `subjects`
SET
  `subjectCode` = COALESCE(NULLIF(`subjectCode`, ''), `code`),
  `subjectName` = COALESCE(NULLIF(`subjectName`, ''), `name`),
  `shortName` = COALESCE(
    NULLIF(`shortName`, ''),
    LEFT(COALESCE(NULLIF(`name`, ''), `code`), 20)
  )
WHERE `subjectCode` IS NULL OR `subjectName` IS NULL OR `shortName` IS NULL;

-- Disambiguate duplicate subject names before unique constraint (MySQL-safe).
CREATE TEMPORARY TABLE `_subject_name_dupes` AS
SELECT `id`,
  CONCAT(`subjectName`, ' (', `id`, ')') AS `uniqueName`
FROM `subjects`
WHERE `subjectName` IN (
  SELECT `subjectName` FROM (
    SELECT `subjectName`
    FROM `subjects`
    GROUP BY `subjectName`
    HAVING COUNT(*) > 1
  ) AS `dup_names`
);

UPDATE `subjects` s
INNER JOIN `_subject_name_dupes` d ON s.`id` = d.`id`
SET s.`subjectName` = d.`uniqueName`;

DROP TEMPORARY TABLE `_subject_name_dupes`;

-- PHASE 3 — CONSTRAIN
ALTER TABLE `subjects` DROP FOREIGN KEY `subjects_departmentId_fkey`;

ALTER TABLE `subjects` DROP INDEX `subjects_code_key`;

ALTER TABLE `subjects`
  MODIFY COLUMN `subjectCode` VARCHAR(191) NOT NULL,
  MODIFY COLUMN `subjectName` VARCHAR(191) NOT NULL,
  MODIFY COLUMN `shortName` VARCHAR(191) NOT NULL,
  MODIFY COLUMN `departmentId` INT NULL;

ALTER TABLE `subjects` DROP COLUMN `code`;
ALTER TABLE `subjects` DROP COLUMN `name`;

CREATE UNIQUE INDEX `subjects_subjectCode_key` ON `subjects`(`subjectCode`);
CREATE UNIQUE INDEX `subjects_subjectName_key` ON `subjects`(`subjectName`);
CREATE INDEX `subjects_category_idx` ON `subjects`(`category`);
CREATE INDEX `subjects_subjectCode_idx` ON `subjects`(`subjectCode`);

ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
