-- Sprint 7.6 — Report Cards (enterprise production)
-- Snapshot-based report cards generated only from published/locked Results.

CREATE TABLE `report_cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `academicYearId` INTEGER NOT NULL,
    `termId` INTEGER NOT NULL,
    `classId` INTEGER NOT NULL,
    `templateKey` VARCHAR(191) NOT NULL DEFAULT 'STANDARD_A4',
    `snapshot` JSON NOT NULL,
    `totalScore` DECIMAL(8, 2) NULL,
    `averageScore` DECIMAL(6, 2) NULL,
    `overallGrade` VARCHAR(191) NULL,
    `classPosition` INTEGER NULL,
    `subjectCount` INTEGER NOT NULL DEFAULT 0,
    `passedCount` INTEGER NOT NULL DEFAULT 0,
    `failedCount` INTEGER NOT NULL DEFAULT 0,
    `daysPresent` INTEGER NULL,
    `daysAbsent` INTEGER NULL,
    `daysLate` INTEGER NULL,
    `daysExcused` INTEGER NULL,
    `attendancePercentage` DECIMAL(5, 2) NULL,
    `teacherRemarks` TEXT NULL,
    `headmasterRemarks` TEXT NULL,
    `promotionDecision` ENUM('PENDING', 'PROMOTED', 'REPEAT', 'CONDITIONAL', 'DEFERRED') NOT NULL DEFAULT 'PENDING',
    `promoted` BOOLEAN NOT NULL DEFAULT false,
    `workflowStatus` ENUM('DRAFT', 'GENERATED', 'VERIFIED', 'PUBLISHED', 'LOCKED') NOT NULL DEFAULT 'GENERATED',
    `generatedAt` DATETIME(3) NULL,
    `generatedById` INTEGER NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedAt` DATETIME(3) NULL,
    `verifiedById` INTEGER NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `publishedById` INTEGER NULL,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `lockedAt` DATETIME(3) NULL,
    `lockedById` INTEGER NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `report_cards_academicYearId_idx`(`academicYearId`),
    INDEX `report_cards_termId_idx`(`termId`),
    INDEX `report_cards_classId_idx`(`classId`),
    INDEX `report_cards_studentId_idx`(`studentId`),
    INDEX `report_cards_templateKey_idx`(`templateKey`),
    INDEX `report_cards_workflowStatus_idx`(`workflowStatus`),
    INDEX `report_cards_isVerified_idx`(`isVerified`),
    INDEX `report_cards_isPublished_idx`(`isPublished`),
    INDEX `report_cards_isLocked_idx`(`isLocked`),
    INDEX `report_cards_promotionDecision_idx`(`promotionDecision`),
    INDEX `report_cards_status_idx`(`status`),
    INDEX `report_cards_generatedById_idx`(`generatedById`),
    INDEX `report_cards_verifiedById_idx`(`verifiedById`),
    INDEX `report_cards_publishedById_idx`(`publishedById`),
    INDEX `report_cards_lockedById_idx`(`lockedById`),
    UNIQUE INDEX `report_card_student_term_key`(`studentId`, `academicYearId`, `termId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `terms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `school_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_generatedById_fkey` FOREIGN KEY (`generatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_publishedById_fkey` FOREIGN KEY (`publishedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `report_cards` ADD CONSTRAINT `report_cards_lockedById_fkey` FOREIGN KEY (`lockedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
