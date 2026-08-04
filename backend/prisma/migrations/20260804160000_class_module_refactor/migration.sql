-- Sprint 6.3: Classes module — classCode/className, academic year, department,
-- class teacher, capacity required, unique classCode per academic year.

-- PHASE 1 — EXPAND
ALTER TABLE `school_classes`
  ADD COLUMN `classCode` VARCHAR(191) NULL,
  ADD COLUMN `className` VARCHAR(191) NULL,
  ADD COLUMN `academicYearId` INT NULL,
  ADD COLUMN `departmentId` INT NULL,
  ADD COLUMN `classTeacherId` INT NULL;

-- PHASE 2 — BACKFILL
UPDATE `school_classes`
SET
  `classCode` = COALESCE(NULLIF(`classCode`, ''), `code`),
  `className` = COALESCE(NULLIF(`className`, ''), `name`),
  `capacity` = COALESCE(`capacity`, 1)
WHERE `classCode` IS NULL OR `className` IS NULL OR `capacity` IS NULL;

UPDATE `school_classes` sc
SET `academicYearId` = (
  SELECT ay.id
  FROM `academic_years` ay
  WHERE ay.deletedAt IS NULL
  ORDER BY ay.isCurrent DESC, ay.startDate DESC, ay.id DESC
  LIMIT 1
)
WHERE sc.academicYearId IS NULL;

-- PHASE 3 — CONSTRAIN
ALTER TABLE `school_classes` DROP INDEX `school_classes_code_key`;

ALTER TABLE `school_classes`
  MODIFY COLUMN `classCode` VARCHAR(191) NOT NULL,
  MODIFY COLUMN `className` VARCHAR(191) NOT NULL,
  MODIFY COLUMN `academicYearId` INT NOT NULL,
  MODIFY COLUMN `capacity` INT NOT NULL;

ALTER TABLE `school_classes` DROP COLUMN `code`;
ALTER TABLE `school_classes` DROP COLUMN `name`;
ALTER TABLE `school_classes` DROP COLUMN `level`;

CREATE UNIQUE INDEX `school_classes_academicYearId_classCode_key`
  ON `school_classes`(`academicYearId`, `classCode`);

CREATE INDEX `school_classes_academicYearId_idx` ON `school_classes`(`academicYearId`);
CREATE INDEX `school_classes_departmentId_idx` ON `school_classes`(`departmentId`);
CREATE INDEX `school_classes_classTeacherId_idx` ON `school_classes`(`classTeacherId`);
CREATE INDEX `school_classes_classCode_idx` ON `school_classes`(`classCode`);

ALTER TABLE `school_classes`
  ADD CONSTRAINT `school_classes_academicYearId_fkey`
    FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `school_classes_departmentId_fkey`
    FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `school_classes_classTeacherId_fkey`
    FOREIGN KEY (`classTeacherId`) REFERENCES `teachers`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
