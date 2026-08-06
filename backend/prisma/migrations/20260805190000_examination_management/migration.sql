-- Sprint 7.4 — Examination Management

-- Clear legacy examination rows that cannot satisfy class-scoped uniqueness.
DELETE FROM `results`;
DELETE FROM `examinations`;

ALTER TABLE `examinations`
    MODIFY `name` VARCHAR(191) NULL,
    CHANGE `totalMarks` `maxMarks` DECIMAL(6, 2) NOT NULL,
    CHANGE `passMarks` `passingMarks` DECIMAL(6, 2) NOT NULL,
    ADD COLUMN `classId` INTEGER NOT NULL,
    ADD COLUMN `examinationType` ENUM(
        'MID_TERM',
        'END_OF_TERM',
        'MOCK',
        'FINAL',
        'ENTRANCE'
    ) NOT NULL,
    ADD COLUMN `durationMinutes` INTEGER NULL,
    ADD COLUMN `remarks` VARCHAR(191) NULL,
    ADD COLUMN `isLocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lockedAt` DATETIME(3) NULL,
    ADD COLUMN `lockedById` INTEGER NULL;

CREATE TABLE `examination_scores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `examinationId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `marks` DECIMAL(6, 2) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `exam_class_subj_type_date_key`
    ON `examinations`(`classId`, `subjectId`, `examinationType`, `examinationDate`);

CREATE INDEX `examinations_classId_idx` ON `examinations`(`classId`);
CREATE INDEX `examinations_examinationType_idx` ON `examinations`(`examinationType`);
CREATE INDEX `examinations_examinationDate_idx` ON `examinations`(`examinationDate`);
CREATE INDEX `examinations_isLocked_idx` ON `examinations`(`isLocked`);
CREATE INDEX `examinations_lockedById_idx` ON `examinations`(`lockedById`);

CREATE UNIQUE INDEX `examination_scores_examinationId_studentId_key`
    ON `examination_scores`(`examinationId`, `studentId`);

CREATE INDEX `examination_scores_examinationId_idx` ON `examination_scores`(`examinationId`);
CREATE INDEX `examination_scores_studentId_idx` ON `examination_scores`(`studentId`);

ALTER TABLE `examinations`
    ADD CONSTRAINT `examinations_classId_fkey`
    FOREIGN KEY (`classId`) REFERENCES `school_classes`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `examinations`
    ADD CONSTRAINT `examinations_lockedById_fkey`
    FOREIGN KEY (`lockedById`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `examination_scores`
    ADD CONSTRAINT `examination_scores_examinationId_fkey`
    FOREIGN KEY (`examinationId`) REFERENCES `examinations`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `examination_scores`
    ADD CONSTRAINT `examination_scores_studentId_fkey`
    FOREIGN KEY (`studentId`) REFERENCES `students`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
