-- Sprint 7.5 — Results Engine

DELETE FROM `results`;

-- Drop all foreign keys on results (legacy shape).
SET @sql := (
  SELECT GROUP_CONCAT(CONCAT('DROP FOREIGN KEY `', CONSTRAINT_NAME, '`') SEPARATOR ', ')
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'results'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql := IF(@sql IS NOT NULL, CONCAT('ALTER TABLE `results` ', @sql), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop legacy unique index if present.
SET @idx := (
  SELECT INDEX_NAME
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'results'
    AND INDEX_NAME = 'results_examinationId_studentId_key'
  LIMIT 1
);
SET @sql := IF(@idx IS NOT NULL, 'DROP INDEX `results_examinationId_studentId_key` ON `results`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Reshape results table for CA + Examination composite engine.
ALTER TABLE `results`
    DROP COLUMN `marks`,
    ADD COLUMN `academicYearId` INTEGER NOT NULL,
    ADD COLUMN `classId` INTEGER NOT NULL,
    ADD COLUMN `caScore` DECIMAL(6, 2) NOT NULL,
    ADD COLUMN `examScore` DECIMAL(6, 2) NOT NULL,
    ADD COLUMN `caWeight` DECIMAL(5, 2) NOT NULL,
    ADD COLUMN `examWeight` DECIMAL(5, 2) NOT NULL,
    ADD COLUMN `finalScore` DECIMAL(6, 2) NOT NULL,
    ADD COLUMN `subjectPosition` INTEGER NULL,
    ADD COLUMN `classPosition` INTEGER NULL,
    ADD COLUMN `subjectAverage` DECIMAL(6, 2) NULL,
    ADD COLUMN `classAverage` DECIMAL(6, 2) NULL,
    ADD COLUMN `isPassed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `publishedById` INTEGER NULL,
    ADD COLUMN `isLocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lockedAt` DATETIME(3) NULL,
    ADD COLUMN `lockedById` INTEGER NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `deletedAt` DATETIME(3) NULL;

CREATE UNIQUE INDEX `result_scope_student_key`
    ON `results`(`academicYearId`, `termId`, `classId`, `subjectId`, `studentId`);

CREATE INDEX `results_academicYearId_idx` ON `results`(`academicYearId`);
CREATE INDEX `results_classId_idx` ON `results`(`classId`);
CREATE INDEX `results_isPassed_idx` ON `results`(`isPassed`);
CREATE INDEX `results_isPublished_idx` ON `results`(`isPublished`);
CREATE INDEX `results_isLocked_idx` ON `results`(`isLocked`);
CREATE INDEX `results_status_idx` ON `results`(`status`);
CREATE INDEX `results_publishedById_idx` ON `results`(`publishedById`);
CREATE INDEX `results_lockedById_idx` ON `results`(`lockedById`);

ALTER TABLE `results`
    ADD CONSTRAINT `results_academicYearId_fkey`
    FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `results`
    ADD CONSTRAINT `results_termId_fkey`
    FOREIGN KEY (`termId`) REFERENCES `terms`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `results`
    ADD CONSTRAINT `results_classId_fkey`
    FOREIGN KEY (`classId`) REFERENCES `school_classes`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `results`
    ADD CONSTRAINT `results_subjectId_fkey`
    FOREIGN KEY (`subjectId`) REFERENCES `subjects`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `results`
    ADD CONSTRAINT `results_studentId_fkey`
    FOREIGN KEY (`studentId`) REFERENCES `students`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `results`
    ADD CONSTRAINT `results_examinationId_fkey`
    FOREIGN KEY (`examinationId`) REFERENCES `examinations`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `results`
    ADD CONSTRAINT `results_gradeId_fkey`
    FOREIGN KEY (`gradeId`) REFERENCES `grades`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `results`
    ADD CONSTRAINT `results_publishedById_fkey`
    FOREIGN KEY (`publishedById`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `results`
    ADD CONSTRAINT `results_lockedById_fkey`
    FOREIGN KEY (`lockedById`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Grade scale linkage for configurable banding.
SET @col := (
  SELECT COLUMN_NAME
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'grades'
    AND COLUMN_NAME = 'gradeScaleId'
  LIMIT 1
);

SET @sql := IF(
  @col IS NULL,
  'ALTER TABLE `grades`
      ADD COLUMN `gradeScaleId` INTEGER NULL,
      ADD COLUMN `isPass` BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx := (
  SELECT INDEX_NAME
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'grades'
    AND INDEX_NAME = 'grades_gradeScaleId_idx'
  LIMIT 1
);
SET @sql := IF(@idx IS NULL, 'CREATE INDEX `grades_gradeScaleId_idx` ON `grades`(`gradeScaleId`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx := (
  SELECT INDEX_NAME
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'grades'
    AND INDEX_NAME = 'grades_sortOrder_idx'
  LIMIT 1
);
SET @sql := IF(@idx IS NULL, 'CREATE INDEX `grades_sortOrder_idx` ON `grades`(`sortOrder`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk := (
  SELECT CONSTRAINT_NAME
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'grades'
    AND CONSTRAINT_NAME = 'grades_gradeScaleId_fkey'
  LIMIT 1
);
SET @sql := IF(
  @fk IS NULL,
  'ALTER TABLE `grades`
      ADD CONSTRAINT `grades_gradeScaleId_fkey`
      FOREIGN KEY (`gradeScaleId`) REFERENCES `grade_scales`(`id`)
      ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
