-- Sprint 6.5: Teacher Subject Assignment — academic year/term scope,
-- weekly periods, soft delete, unique teacher+subject+year+term.

-- PHASE 1 — EXPAND
ALTER TABLE `teacher_subjects`
  ADD COLUMN `academicYearId` INT NULL,
  ADD COLUMN `termId` INT NULL,
  ADD COLUMN `isPrimary` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `weeklyPeriods` INT NOT NULL DEFAULT 1,
  ADD COLUMN `remarks` VARCHAR(191) NULL,
  ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- PHASE 2 — BACKFILL academicYearId (prefer current year, else earliest)
UPDATE `teacher_subjects` ts
SET `academicYearId` = (
  SELECT `id` FROM `academic_years`
  WHERE `deletedAt` IS NULL
  ORDER BY `isCurrent` DESC, `startDate` ASC
  LIMIT 1
)
WHERE `academicYearId` IS NULL;

-- If any rows remain without a year (empty academic_years), create a placeholder.
INSERT INTO `academic_years` (`name`, `startDate`, `endDate`, `isCurrent`, `status`, `createdAt`, `updatedAt`)
SELECT
  'Migration Placeholder Year',
  '2026-01-01 00:00:00.000',
  '2026-12-31 23:59:59.000',
  false,
  'INACTIVE',
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE EXISTS (
  SELECT 1 FROM `teacher_subjects` WHERE `academicYearId` IS NULL
)
AND NOT EXISTS (
  SELECT 1 FROM `academic_years` WHERE `name` = 'Migration Placeholder Year'
);

UPDATE `teacher_subjects` ts
SET `academicYearId` = (
  SELECT `id` FROM `academic_years` WHERE `name` = 'Migration Placeholder Year' LIMIT 1
)
WHERE `academicYearId` IS NULL;

-- PHASE 3 — CONSTRAIN
ALTER TABLE `teacher_subjects`
  MODIFY COLUMN `academicYearId` INT NOT NULL;

-- Drop legacy unique + assignedDate
ALTER TABLE `teacher_subjects` DROP INDEX `teacher_subjects_teacherId_subjectId_key`;

ALTER TABLE `teacher_subjects` DROP COLUMN `assignedDate`;

-- New uniqueness + indexes
CREATE UNIQUE INDEX `teacher_subjects_teacherId_subjectId_academicYearId_termId_key`
  ON `teacher_subjects`(`teacherId`, `subjectId`, `academicYearId`, `termId`);

CREATE INDEX `teacher_subjects_academicYearId_idx` ON `teacher_subjects`(`academicYearId`);
CREATE INDEX `teacher_subjects_termId_idx` ON `teacher_subjects`(`termId`);

ALTER TABLE `teacher_subjects`
  ADD CONSTRAINT `teacher_subjects_academicYearId_fkey`
    FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `teacher_subjects`
  ADD CONSTRAINT `teacher_subjects_termId_fkey`
    FOREIGN KEY (`termId`) REFERENCES `terms`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
