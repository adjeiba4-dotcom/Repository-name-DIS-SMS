-- Sprint 6.7: Student Enrollment — enrollment number, schoolClassId rename,
-- optional term, remarks, soft delete.

ALTER TABLE `enrollments` DROP FOREIGN KEY `enrollments_classId_fkey`;

DROP INDEX `enrollments_classId_idx` ON `enrollments`;

ALTER TABLE `enrollments`
  CHANGE COLUMN `classId` `schoolClassId` INTEGER NOT NULL;

ALTER TABLE `enrollments`
  ADD COLUMN `enrollmentNumber` VARCHAR(191) NULL,
  ADD COLUMN `termId` INTEGER NULL,
  ADD COLUMN `remarks` VARCHAR(191) NULL,
  ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- Backfill enrollment numbers for any existing rows.
UPDATE `enrollments`
SET `enrollmentNumber` = CONCAT(
  'ENR-',
  YEAR(COALESCE(`enrollmentDate`, `createdAt`, CURRENT_TIMESTAMP(3))),
  '-',
  LPAD(`id`, 6, '0')
)
WHERE `enrollmentNumber` IS NULL;

ALTER TABLE `enrollments`
  MODIFY COLUMN `enrollmentNumber` VARCHAR(191) NOT NULL;

CREATE UNIQUE INDEX `enrollments_enrollmentNumber_key`
  ON `enrollments`(`enrollmentNumber`);

CREATE INDEX `enrollments_schoolClassId_idx` ON `enrollments`(`schoolClassId`);
CREATE INDEX `enrollments_termId_idx` ON `enrollments`(`termId`);
CREATE INDEX `enrollments_status_idx` ON `enrollments`(`status`);

ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_schoolClassId_fkey`
    FOREIGN KEY (`schoolClassId`) REFERENCES `school_classes`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_termId_fkey`
    FOREIGN KEY (`termId`) REFERENCES `terms`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
