-- Sprint 7.7 — Student Promotion & Graduation (enterprise production)
-- Expand PromotionDecision, add PromotionWorkflowStatus, create student_promotions.

-- 1) Expand report_cards.promotionDecision to include new values (keep legacy temporarily)
ALTER TABLE `report_cards`
  MODIFY COLUMN `promotionDecision`
  ENUM(
    'PENDING',
    'PROMOTED',
    'REPEAT',
    'CONDITIONAL',
    'DEFERRED',
    'PROMOTED_ON_PROBATION',
    'GRADUATED',
    'WITHDRAWN',
    'TRANSFERRED'
  ) NOT NULL DEFAULT 'PENDING';

-- 2) Migrate legacy report-card decisions
UPDATE `report_cards`
SET `promotionDecision` = 'PROMOTED_ON_PROBATION'
WHERE `promotionDecision` = 'CONDITIONAL';

UPDATE `report_cards`
SET `promotionDecision` = 'PENDING'
WHERE `promotionDecision` = 'DEFERRED';

-- 3) Finalize enum (drop CONDITIONAL / DEFERRED)
ALTER TABLE `report_cards`
  MODIFY COLUMN `promotionDecision`
  ENUM(
    'PENDING',
    'PROMOTED',
    'PROMOTED_ON_PROBATION',
    'REPEAT',
    'GRADUATED',
    'WITHDRAWN',
    'TRANSFERRED'
  ) NOT NULL DEFAULT 'PENDING';

-- 4) Student promotions table
CREATE TABLE `student_promotions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `fromClassId` INTEGER NOT NULL,
    `toClassId` INTEGER NULL,
    `fromAcademicYearId` INTEGER NOT NULL,
    `toAcademicYearId` INTEGER NULL,
    `termId` INTEGER NULL,
    `reportCardId` INTEGER NULL,
    `decision` ENUM(
      'PENDING',
      'PROMOTED',
      'PROMOTED_ON_PROBATION',
      'REPEAT',
      'GRADUATED',
      'WITHDRAWN',
      'TRANSFERRED'
    ) NOT NULL,
    `workflowStatus` ENUM('DRAFT', 'APPROVED', 'EXECUTED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `averageScore` DECIMAL(6, 2) NULL,
    `overallGrade` VARCHAR(191) NULL,
    `classPosition` INTEGER NULL,
    `subjectCount` INTEGER NULL,
    `passedCount` INTEGER NULL,
    `failedCount` INTEGER NULL,
    `remarks` TEXT NULL,
    `recommendationNotes` TEXT NULL,
    `recommendedAt` DATETIME(3) NULL,
    `recommendedById` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedById` INTEGER NULL,
    `executedAt` DATETIME(3) NULL,
    `executedById` INTEGER NULL,
    `promotionDate` DATETIME(3) NULL,
    `resultingEnrollmentId` INTEGER NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `student_promotions_studentId_idx`(`studentId`),
    INDEX `student_promotions_fromClassId_idx`(`fromClassId`),
    INDEX `student_promotions_toClassId_idx`(`toClassId`),
    INDEX `student_promotions_fromAcademicYearId_idx`(`fromAcademicYearId`),
    INDEX `student_promotions_toAcademicYearId_idx`(`toAcademicYearId`),
    INDEX `student_promotions_termId_idx`(`termId`),
    INDEX `student_promotions_reportCardId_idx`(`reportCardId`),
    INDEX `student_promotions_decision_idx`(`decision`),
    INDEX `student_promotions_workflowStatus_idx`(`workflowStatus`),
    INDEX `student_promotions_status_idx`(`status`),
    INDEX `student_promotions_recommendedById_idx`(`recommendedById`),
    INDEX `student_promotions_approvedById_idx`(`approvedById`),
    INDEX `student_promotions_executedById_idx`(`executedById`),
    INDEX `student_promotions_resultingEnrollmentId_idx`(`resultingEnrollmentId`),
    UNIQUE INDEX `student_promotion_year_key`(`studentId`, `fromAcademicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_studentId_fkey`
  FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_fromClassId_fkey`
  FOREIGN KEY (`fromClassId`) REFERENCES `school_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_toClassId_fkey`
  FOREIGN KEY (`toClassId`) REFERENCES `school_classes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_fromAcademicYearId_fkey`
  FOREIGN KEY (`fromAcademicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_toAcademicYearId_fkey`
  FOREIGN KEY (`toAcademicYearId`) REFERENCES `academic_years`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_termId_fkey`
  FOREIGN KEY (`termId`) REFERENCES `terms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_reportCardId_fkey`
  FOREIGN KEY (`reportCardId`) REFERENCES `report_cards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_resultingEnrollmentId_fkey`
  FOREIGN KEY (`resultingEnrollmentId`) REFERENCES `enrollments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_recommendedById_fkey`
  FOREIGN KEY (`recommendedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_approvedById_fkey`
  FOREIGN KEY (`approvedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `student_promotions`
  ADD CONSTRAINT `student_promotions_executedById_fkey`
  FOREIGN KEY (`executedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
