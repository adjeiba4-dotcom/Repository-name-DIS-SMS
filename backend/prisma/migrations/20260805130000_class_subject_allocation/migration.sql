-- Sprint 6.6: Class Subject Allocation — class+subject+year+term scope,
-- teacher-subject linkage, weekly periods, soft delete.

CREATE TABLE `class_subjects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schoolClassId` INTEGER NOT NULL,
    `teacherSubjectId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,
    `termId` INTEGER NULL,
    `weeklyPeriods` INTEGER NOT NULL DEFAULT 1,
    `isCompulsory` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `remarks` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `class_subjects_schoolClassId_subjectId_academicYearId_termId_key`
  ON `class_subjects`(`schoolClassId`, `subjectId`, `academicYearId`, `termId`);

CREATE INDEX `class_subjects_schoolClassId_idx` ON `class_subjects`(`schoolClassId`);
CREATE INDEX `class_subjects_teacherSubjectId_idx` ON `class_subjects`(`teacherSubjectId`);
CREATE INDEX `class_subjects_subjectId_idx` ON `class_subjects`(`subjectId`);
CREATE INDEX `class_subjects_academicYearId_idx` ON `class_subjects`(`academicYearId`);
CREATE INDEX `class_subjects_termId_idx` ON `class_subjects`(`termId`);
CREATE INDEX `class_subjects_status_idx` ON `class_subjects`(`status`);
CREATE INDEX `class_subjects_displayOrder_idx` ON `class_subjects`(`displayOrder`);

ALTER TABLE `class_subjects`
  ADD CONSTRAINT `class_subjects_schoolClassId_fkey`
    FOREIGN KEY (`schoolClassId`) REFERENCES `school_classes`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `class_subjects`
  ADD CONSTRAINT `class_subjects_teacherSubjectId_fkey`
    FOREIGN KEY (`teacherSubjectId`) REFERENCES `teacher_subjects`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `class_subjects`
  ADD CONSTRAINT `class_subjects_subjectId_fkey`
    FOREIGN KEY (`subjectId`) REFERENCES `subjects`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `class_subjects`
  ADD CONSTRAINT `class_subjects_academicYearId_fkey`
    FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `class_subjects`
  ADD CONSTRAINT `class_subjects_termId_fkey`
    FOREIGN KEY (`termId`) REFERENCES `terms`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
