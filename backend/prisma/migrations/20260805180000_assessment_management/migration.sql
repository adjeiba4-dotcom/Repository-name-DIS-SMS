-- Sprint 7.3 — Assessment Management

CREATE TABLE `assessments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `academicYearId` INTEGER NOT NULL,
    `termId` INTEGER NOT NULL,
    `classId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `teacherId` INTEGER NOT NULL,
    `assessmentType` ENUM(
        'CLASS_WORK',
        'HOMEWORK',
        'QUIZ',
        'ASSIGNMENT',
        'PRACTICAL',
        'PROJECT',
        'ORAL_TEST',
        'MID_TERM',
        'CONTINUOUS_ASSESSMENT'
    ) NOT NULL,
    `maxMarks` DECIMAL(6, 2) NOT NULL,
    `assessmentDate` DATETIME(3) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `assessment_scores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessmentId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `marks` DECIMAL(6, 2) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `assessments_classId_subjectId_assessmentType_assessmentDate_key`
    ON `assessments`(`classId`, `subjectId`, `assessmentType`, `assessmentDate`);

CREATE INDEX `assessments_academicYearId_idx` ON `assessments`(`academicYearId`);
CREATE INDEX `assessments_termId_idx` ON `assessments`(`termId`);
CREATE INDEX `assessments_classId_idx` ON `assessments`(`classId`);
CREATE INDEX `assessments_subjectId_idx` ON `assessments`(`subjectId`);
CREATE INDEX `assessments_teacherId_idx` ON `assessments`(`teacherId`);
CREATE INDEX `assessments_assessmentType_idx` ON `assessments`(`assessmentType`);
CREATE INDEX `assessments_assessmentDate_idx` ON `assessments`(`assessmentDate`);
CREATE INDEX `assessments_status_idx` ON `assessments`(`status`);

CREATE UNIQUE INDEX `assessment_scores_assessmentId_studentId_key`
    ON `assessment_scores`(`assessmentId`, `studentId`);

CREATE INDEX `assessment_scores_assessmentId_idx` ON `assessment_scores`(`assessmentId`);
CREATE INDEX `assessment_scores_studentId_idx` ON `assessment_scores`(`studentId`);

ALTER TABLE `assessments`
    ADD CONSTRAINT `assessments_academicYearId_fkey`
    FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `assessments`
    ADD CONSTRAINT `assessments_termId_fkey`
    FOREIGN KEY (`termId`) REFERENCES `terms`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `assessments`
    ADD CONSTRAINT `assessments_classId_fkey`
    FOREIGN KEY (`classId`) REFERENCES `school_classes`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `assessments`
    ADD CONSTRAINT `assessments_subjectId_fkey`
    FOREIGN KEY (`subjectId`) REFERENCES `subjects`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `assessments`
    ADD CONSTRAINT `assessments_teacherId_fkey`
    FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `assessment_scores`
    ADD CONSTRAINT `assessment_scores_assessmentId_fkey`
    FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `assessment_scores`
    ADD CONSTRAINT `assessment_scores_studentId_fkey`
    FOREIGN KEY (`studentId`) REFERENCES `students`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
