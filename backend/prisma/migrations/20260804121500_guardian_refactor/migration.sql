-- =============================================================================
-- DIS-SMS — Guardian Refactor
-- Replaces Student → Guardian one-to-many with StudentGuardian many-to-many.
-- Live row counts at authoring: guardians=0, students=0 (no backfill required).
-- Scope: guardians + students.guardianId + student_guardians only.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Detach Student.guardianId (legacy one-to-many)
-- -----------------------------------------------------------------------------
ALTER TABLE `students`
  DROP FOREIGN KEY `students_guardianId_fkey`;

DROP INDEX `students_guardianId_idx` ON `students`;

ALTER TABLE `students`
  DROP COLUMN `guardianId`;

-- -----------------------------------------------------------------------------
-- 2) Expand Guardian to enterprise shape
--    Keep existing alternatePhone (already present on live).
--    Drop relationship/address (relationship moves to StudentGuardian).
-- -----------------------------------------------------------------------------
DROP INDEX `guardians_email_key` ON `guardians`;

ALTER TABLE `guardians`
  DROP COLUMN `relationship`,
  DROP COLUMN `address`,
  ADD COLUMN `guardianNumber` VARCHAR(191) NOT NULL,
  ADD COLUMN `middleName` VARCHAR(191) NULL,
  ADD COLUMN `gender` ENUM('MALE', 'FEMALE') NOT NULL,
  ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
  ADD COLUMN `nationalId` VARCHAR(191) NULL,
  ADD COLUMN `employer` VARCHAR(191) NULL,
  ADD COLUMN `residentialAddress` VARCHAR(191) NULL,
  ADD COLUMN `digitalAddress` VARCHAR(191) NULL,
  ADD COLUMN `photo` VARCHAR(191) NULL,
  ADD COLUMN `notes` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `guardians_guardianNumber_key` ON `guardians`(`guardianNumber`);
CREATE UNIQUE INDEX `guardians_nationalId_key` ON `guardians`(`nationalId`);
CREATE INDEX `guardians_email_idx` ON `guardians`(`email`);

-- -----------------------------------------------------------------------------
-- 3) StudentGuardian junction
-- -----------------------------------------------------------------------------
CREATE TABLE `student_guardians` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `guardianId` INTEGER NOT NULL,
    `relationship` ENUM('FATHER', 'MOTHER', 'GUARDIAN', 'SPONSOR', 'UNCLE', 'AUNT', 'BROTHER', 'SISTER', 'GRANDPARENT', 'OTHER') NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `emergencyContact` BOOLEAN NOT NULL DEFAULT false,
    `financialResponsibility` BOOLEAN NOT NULL DEFAULT false,
    `canPickup` BOOLEAN NOT NULL DEFAULT false,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `student_guardians_studentId_idx`(`studentId`),
    INDEX `student_guardians_guardianId_idx`(`guardianId`),
    INDEX `student_guardians_relationship_idx`(`relationship`),
    INDEX `student_guardians_isPrimary_idx`(`isPrimary`),
    UNIQUE INDEX `student_guardians_studentId_guardianId_key`(`studentId`, `guardianId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `student_guardians`
  ADD CONSTRAINT `student_guardians_studentId_fkey`
    FOREIGN KEY (`studentId`) REFERENCES `students`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_guardians_guardianId_fkey`
    FOREIGN KEY (`guardianId`) REFERENCES `guardians`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
