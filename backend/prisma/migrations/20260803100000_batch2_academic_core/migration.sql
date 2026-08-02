-- =============================================================================
-- DIS-SMS Batch 2 — Academic Core (ADDITIVE / EXPAND → BACKFILL → CONSTRAIN)
-- Strategy: enterprise forward-only alignment of Academic Core models
-- Forbidden in this file: DROP TABLE, DROP COLUMN, DELETE, destructive RENAME
-- Scope: Academic only. Does NOT touch Finance, Library, Inventory, HR payroll,
--        Transport, Hostel, Assets, or Reporting domain tables.
--
-- Live DB note (pre-migration snapshot):
--   • All Academic Core row counts = 0 (no production data risk for backfill)
--   • Partial prior drift from failed historical migration is preserved
--   • Legacy columns retained: examinations.examDate, results.grade,
--     guardians.alternatePhone (CONTRACT deferred to a future approved batch)
-- =============================================================================

-- #############################################################################
-- PHASE 1 — EXPAND
-- Add missing columns / tables as nullable or defaulted. No data loss.
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 1.1) teacher_subjects — add assignment metadata + audit columns
-- WHY: Prisma TeacherSubject requires assignedDate, status, createdAt, updatedAt.
--      Live table only has id/teacherId/subjectId (initial schema).
-- WHAT: Adds four columns (nullable first for safe expand).
-- SAFE: Additive only; existing rows (none today) remain intact.
-- -----------------------------------------------------------------------------
ALTER TABLE `teacher_subjects`
  ADD COLUMN `assignedDate` DATETIME(3) NULL,
  ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NULL,
  ADD COLUMN `createdAt` DATETIME(3) NULL,
  ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- -----------------------------------------------------------------------------
-- 1.2) students — restore contact columns expected by Prisma Student model
-- WHY: Live DB is missing email/phone/address (dropped during partial historical
--      drift). Prisma schema defines them as optional String? fields.
-- WHAT: Adds three nullable VARCHAR columns.
-- SAFE: Additive; no existing values overwritten; nullable matches schema.
-- -----------------------------------------------------------------------------
ALTER TABLE `students`
  ADD COLUMN `email` VARCHAR(191) NULL,
  ADD COLUMN `phone` VARCHAR(191) NULL,
  ADD COLUMN `address` VARCHAR(191) NULL;

-- -----------------------------------------------------------------------------
-- 1.3) attendance — add updatedAt
-- WHY: Prisma Attendance.updatedAt (@updatedAt) is required.
-- WHAT: Adds nullable updatedAt for expand-then-constrain.
-- SAFE: Additive; backfilled from createdAt in Phase 2.
-- -----------------------------------------------------------------------------
ALTER TABLE `attendance`
  ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- -----------------------------------------------------------------------------
-- 1.4) examinations — add Prisma-aligned columns; keep legacy examDate
-- WHY: Schema expects examinationDate, passMarks, status, updatedAt, deletedAt.
--      Live has examDate (legacy name) and int totalMarks; passMarks/status/
--      updatedAt/deletedAt are missing after partial historical drift.
-- WHAT: Adds five columns. Does NOT drop examDate (non-destructive rename).
-- SAFE: Additive; examinationDate backfilled from examDate in Phase 2.
-- -----------------------------------------------------------------------------
ALTER TABLE `examinations`
  ADD COLUMN `examinationDate` DATETIME(3) NULL,
  ADD COLUMN `passMarks` DECIMAL(6, 2) NULL,
  ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NULL,
  ADD COLUMN `updatedAt` DATETIME(3) NULL,
  ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- -----------------------------------------------------------------------------
-- 1.5) results — add gradeId FK column + updatedAt; keep legacy grade VARCHAR
-- WHY: Schema uses optional Grade relation (gradeId) and required updatedAt.
--      Legacy results.grade VARCHAR is retained for CONTRACT-later cleanup.
-- WHAT: Adds gradeId (nullable) and updatedAt (nullable).
-- SAFE: Additive; FK added in Phase 3 after grades table exists.
-- -----------------------------------------------------------------------------
ALTER TABLE `results`
  ADD COLUMN `gradeId` INT NULL,
  ADD COLUMN `updatedAt` DATETIME(3) NULL;

-- -----------------------------------------------------------------------------
-- 1.6) grades — greenfield lookup table for Result.gradeId
-- WHY: Missing table required by Prisma Grade model and Result relation.
-- WHAT: Creates empty grades table with unique grade code + status index.
-- SAFE: CREATE TABLE only; no impact on existing data.
-- -----------------------------------------------------------------------------
CREATE TABLE `grades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `grade` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `minimumScore` DECIMAL(6, 2) NOT NULL,
    `maximumScore` DECIMAL(6, 2) NOT NULL,
    `gradePoint` DECIMAL(4, 2) NULL,
    `remarks` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `grades_grade_key`(`grade`),
    INDEX `grades_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 1.7) grade_scales — greenfield grade-scale configuration
-- WHY: Missing table required by Prisma GradeScale model.
-- WHAT: Creates empty grade_scales table.
-- SAFE: CREATE TABLE only; no FKs into existing academic data.
-- -----------------------------------------------------------------------------
CREATE TABLE `grade_scales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `grade_scales_name_key`(`name`),
    INDEX `grade_scales_status_idx`(`status`),
    INDEX `grade_scales_isDefault_idx`(`isDefault`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 1.8) timetables — greenfield class timetable slots
-- WHY: Missing table required by Prisma Timetable model and academic relations.
-- WHAT: Creates empty timetables with unique slot key and relation indexes.
-- SAFE: CREATE TABLE only; FKs added immediately (empty → no orphan risk).
-- -----------------------------------------------------------------------------
CREATE TABLE `timetables` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `academicYearId` INTEGER NOT NULL,
    `termId` INTEGER NOT NULL,
    `classId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `teacherId` INTEGER NOT NULL,
    `dayOfWeek` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `room` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `timetables_academicYearId_termId_classId_dayOfWeek_startTime_key`(`academicYearId`, `termId`, `classId`, `dayOfWeek`, `startTime`),
    INDEX `timetables_academicYearId_idx`(`academicYearId`),
    INDEX `timetables_termId_idx`(`termId`),
    INDEX `timetables_classId_idx`(`classId`),
    INDEX `timetables_subjectId_idx`(`subjectId`),
    INDEX `timetables_teacherId_idx`(`teacherId`),
    INDEX `timetables_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 1.9) timetable_entries — greenfield subject/teacher period entries
-- WHY: Missing table required by Prisma TimetableEntry model.
-- WHAT: Creates empty timetable_entries with subject/teacher indexes.
-- SAFE: CREATE TABLE only; FKs added on empty table.
-- -----------------------------------------------------------------------------
CREATE TABLE `timetable_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subjectId` INTEGER NOT NULL,
    `teacherId` INTEGER NOT NULL,
    `dayOfWeek` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `room` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `timetable_entries_subjectId_idx`(`subjectId`),
    INDEX `timetable_entries_teacherId_idx`(`teacherId`),
    INDEX `timetable_entries_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- #############################################################################
-- PHASE 2 — BACKFILL
-- Populate new columns from legacy sources / safe defaults. No deletes.
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 2.1) teacher_subjects defaults
-- WHY: New columns must be non-null per schema after constrain.
-- WHAT: assignedDate/createdAt/updatedAt ← NOW; status ← ACTIVE.
-- SAFE: Only fills NULLs; empty table today → no row rewrites at scale.
-- -----------------------------------------------------------------------------
UPDATE `teacher_subjects`
SET
  `assignedDate` = COALESCE(`assignedDate`, CURRENT_TIMESTAMP(3)),
  `status` = COALESCE(`status`, 'ACTIVE'),
  `createdAt` = COALESCE(`createdAt`, CURRENT_TIMESTAMP(3)),
  `updatedAt` = COALESCE(`updatedAt`, CURRENT_TIMESTAMP(3))
WHERE
  `assignedDate` IS NULL
  OR `status` IS NULL
  OR `createdAt` IS NULL
  OR `updatedAt` IS NULL;

-- -----------------------------------------------------------------------------
-- 2.2) attendance.updatedAt ← createdAt
-- WHY: Preserve temporal meaning for any existing rows; satisfy NOT NULL.
-- WHAT: Copies createdAt into updatedAt where null.
-- SAFE: Non-destructive copy; empty table today.
-- -----------------------------------------------------------------------------
UPDATE `attendance`
SET `updatedAt` = COALESCE(`updatedAt`, `createdAt`, CURRENT_TIMESTAMP(3))
WHERE `updatedAt` IS NULL;

-- -----------------------------------------------------------------------------
-- 2.3) examinations — map legacy examDate → examinationDate; default marks/status
-- WHY: Non-destructive rename via dual-write column; passMarks/status required.
-- WHAT: examinationDate ← examDate; passMarks ← 0 when null; status ← ACTIVE;
--       updatedAt ← createdAt/NOW.
-- SAFE: Keeps examDate; only fills NULLs on new columns. Empty table today.
-- -----------------------------------------------------------------------------
UPDATE `examinations`
SET
  `examinationDate` = COALESCE(`examinationDate`, `examDate`),
  `passMarks` = COALESCE(`passMarks`, 0),
  `status` = COALESCE(`status`, 'ACTIVE'),
  `updatedAt` = COALESCE(`updatedAt`, `createdAt`, CURRENT_TIMESTAMP(3))
WHERE
  `examinationDate` IS NULL
  OR `passMarks` IS NULL
  OR `status` IS NULL
  OR `updatedAt` IS NULL;

-- -----------------------------------------------------------------------------
-- 2.4) results.updatedAt ← createdAt
-- WHY: Satisfy Prisma @updatedAt NOT NULL after constrain.
-- WHAT: Copies createdAt into updatedAt where null.
-- SAFE: Non-destructive; empty table today.
-- -----------------------------------------------------------------------------
UPDATE `results`
SET `updatedAt` = COALESCE(`updatedAt`, `createdAt`, CURRENT_TIMESTAMP(3))
WHERE `updatedAt` IS NULL;

-- -----------------------------------------------------------------------------
-- 2.5) school_classes.level — prepare NOT NULL constrain
-- WHY: Prisma SchoolClass.level is required String; live column is nullable.
-- WHAT: Placeholder backfill for any NULL/empty level values.
-- SAFE: Only touches NULL/empty; 0 rows today → no data rewrite.
-- -----------------------------------------------------------------------------
UPDATE `school_classes`
SET `level` = 'UNSPECIFIED'
WHERE `level` IS NULL OR `level` = '';

-- #############################################################################
-- PHASE 3 — CONSTRAIN
-- Tighten nullability, widen types safely, add indexes + foreign keys.
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 3.1) teacher_subjects — NOT NULL + defaults aligned to Prisma
-- WHY: Schema fields are required (assignedDate, status, createdAt, updatedAt).
-- WHAT: MODIFY columns to NOT NULL with defaults where appropriate.
-- SAFE: Phase 2 removed NULLs; empty table → no constraint failures.
-- -----------------------------------------------------------------------------
ALTER TABLE `teacher_subjects`
  MODIFY COLUMN `assignedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  MODIFY COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- -----------------------------------------------------------------------------
-- 3.2) attendance.updatedAt NOT NULL
-- WHY: Prisma requires updatedAt.
-- WHAT: MODIFY to NOT NULL after backfill.
-- SAFE: No NULL values remain after Phase 2.
-- -----------------------------------------------------------------------------
ALTER TABLE `attendance`
  MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- -----------------------------------------------------------------------------
-- 3.3) examinations — constrain new columns + widen totalMarks INT → DECIMAL(6,2)
-- WHY: Schema uses Decimal(6,2) for totalMarks/passMarks; examinationDate required.
-- WHAT: NOT NULL on new required cols; widen totalMarks (int→decimal is non-lossy).
-- SAFE: Empty table; widening numeric type does not truncate integers.
--       Legacy examDate retained unchanged.
-- -----------------------------------------------------------------------------
ALTER TABLE `examinations`
  MODIFY COLUMN `examinationDate` DATETIME(3) NOT NULL,
  MODIFY COLUMN `totalMarks` DECIMAL(6, 2) NOT NULL,
  MODIFY COLUMN `passMarks` DECIMAL(6, 2) NOT NULL,
  MODIFY COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- -----------------------------------------------------------------------------
-- 3.4) results — constrain updatedAt; widen marks DECIMAL(5,2) → DECIMAL(6,2)
-- WHY: Schema marks is Decimal(6,2); updatedAt required; gradeId stays nullable.
-- WHAT: Widen marks precision; NOT NULL updatedAt.
-- SAFE: Precision widen is non-lossy; empty table today.
-- -----------------------------------------------------------------------------
ALTER TABLE `results`
  MODIFY COLUMN `marks` DECIMAL(6, 2) NOT NULL,
  MODIFY COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- -----------------------------------------------------------------------------
-- 3.5) school_classes.level NOT NULL
-- WHY: Prisma requires level.
-- WHAT: MODIFY level to NOT NULL after placeholder backfill.
-- SAFE: No NULL/empty values remain after Phase 2.
-- -----------------------------------------------------------------------------
ALTER TABLE `school_classes`
  MODIFY COLUMN `level` VARCHAR(191) NOT NULL;

-- -----------------------------------------------------------------------------
-- 3.6) students — relax over-tight nullability to match Prisma (additive)
-- WHY: Live dateOfBirth/guardianId are NOT NULL; schema allows NULL.
-- WHAT: MODIFY to NULL (loosening constraint — non-destructive).
-- SAFE: Relaxing NOT NULL never loses data; enables optional guardian/DOB.
-- -----------------------------------------------------------------------------
ALTER TABLE `students`
  MODIFY COLUMN `dateOfBirth` DATETIME(3) NULL,
  MODIFY COLUMN `guardianId` INT NULL;

-- -----------------------------------------------------------------------------
-- 3.7) Status / filter indexes on existing academic tables
-- WHY: Prisma @@index definitions missing on live MySQL.
-- WHAT: Creates additive secondary indexes only.
-- SAFE: No data change; may briefly lock tables on InnoDB (empty → negligible).
-- -----------------------------------------------------------------------------
CREATE INDEX `academic_years_status_idx` ON `academic_years`(`status`);
CREATE INDEX `academic_years_isCurrent_idx` ON `academic_years`(`isCurrent`);

CREATE INDEX `terms_status_idx` ON `terms`(`status`);
CREATE INDEX `terms_isCurrent_idx` ON `terms`(`isCurrent`);

CREATE INDEX `departments_status_idx` ON `departments`(`status`);

CREATE INDEX `school_classes_status_idx` ON `school_classes`(`status`);

CREATE INDEX `teachers_status_idx` ON `teachers`(`status`);

CREATE INDEX `subjects_status_idx` ON `subjects`(`status`);

CREATE INDEX `teacher_subjects_status_idx` ON `teacher_subjects`(`status`);

CREATE INDEX `guardians_phone_idx` ON `guardians`(`phone`);
CREATE INDEX `guardians_status_idx` ON `guardians`(`status`);

CREATE INDEX `students_status_idx` ON `students`(`status`);

-- -----------------------------------------------------------------------------
-- 3.8) enrollments — Prisma-named indexes
-- WHY: @@index([studentId]) / @@index([academicYearId]) missing under Prisma names.
--      academicYearId currently indexed as enrollments_academicYearId_fkey only.
-- WHAT: Add studentId index; rename fkey index to Prisma name (metadata only).
-- SAFE: RENAME INDEX is non-destructive; no column/data change.
-- -----------------------------------------------------------------------------
CREATE INDEX `enrollments_studentId_idx` ON `enrollments`(`studentId`);
ALTER TABLE `enrollments` RENAME INDEX `enrollments_academicYearId_fkey` TO `enrollments_academicYearId_idx`;

-- -----------------------------------------------------------------------------
-- 3.9) attendance — Prisma-named indexes
-- WHY: Missing attendanceDate index; AY/term indexes exist under *_fkey names.
-- WHAT: Add attendanceDate + studentId indexes; rename fkey indexes to Prisma names.
-- SAFE: Metadata rename + additive indexes only.
-- -----------------------------------------------------------------------------
CREATE INDEX `attendance_studentId_idx` ON `attendance`(`studentId`);
CREATE INDEX `attendance_attendanceDate_idx` ON `attendance`(`attendanceDate`);
ALTER TABLE `attendance` RENAME INDEX `attendance_academicYearId_fkey` TO `attendance_academicYearId_idx`;
ALTER TABLE `attendance` RENAME INDEX `attendance_termId_fkey` TO `attendance_termId_idx`;

-- -----------------------------------------------------------------------------
-- 3.10) examinations — status index
-- WHY: Prisma @@index([status]) missing.
-- WHAT: CREATE INDEX examinations_status_idx.
-- SAFE: Additive.
-- -----------------------------------------------------------------------------
CREATE INDEX `examinations_status_idx` ON `examinations`(`status`);

-- -----------------------------------------------------------------------------
-- 3.11) results — Prisma unique/index alignment + gradeId index
-- WHY: Schema @@unique([examinationId, studentId]) and @@index([studentId]),
--      @@index([gradeId]). Live has unique on (studentId, examinationId) only.
-- WHAT: Add Prisma-ordered unique; add studentId + gradeId indexes.
-- SAFE: Additive; legacy unique retained (no DROP). Empty table → no dup risk.
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX `results_examinationId_studentId_key` ON `results`(`examinationId`, `studentId`);
CREATE INDEX `results_studentId_idx` ON `results`(`studentId`);
CREATE INDEX `results_gradeId_idx` ON `results`(`gradeId`);

-- -----------------------------------------------------------------------------
-- 3.12) Foreign keys for greenfield + results.gradeId
-- WHY: Enforce referential integrity per Prisma relations.
-- WHAT: FKs on timetables, timetable_entries, results.gradeId.
-- SAFE: Child tables empty / gradeId all NULL → no orphan failures.
-- -----------------------------------------------------------------------------
ALTER TABLE `timetables`
  ADD CONSTRAINT `timetables_academicYearId_fkey`
    FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `timetables_termId_fkey`
    FOREIGN KEY (`termId`) REFERENCES `terms`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `timetables_classId_fkey`
    FOREIGN KEY (`classId`) REFERENCES `school_classes`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `timetables_subjectId_fkey`
    FOREIGN KEY (`subjectId`) REFERENCES `subjects`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `timetables_teacherId_fkey`
    FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `timetable_entries`
  ADD CONSTRAINT `timetable_entries_subjectId_fkey`
    FOREIGN KEY (`subjectId`) REFERENCES `subjects`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `timetable_entries_teacherId_fkey`
    FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `results`
  ADD CONSTRAINT `results_gradeId_fkey`
    FOREIGN KEY (`gradeId`) REFERENCES `grades`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- #############################################################################
-- PHASE 4 — CONTRACT
-- DEFERRED (explicitly out of scope for Batch 2)
-- Retained intentionally for non-destructive forward migration:
--   • examinations.examDate          (legacy; dual-write source for examinationDate)
--   • results.grade                  (legacy VARCHAR label)
--   • guardians.alternatePhone       (extra vs Prisma; harmless leftover)
--   • results_studentId_examinationId_key (legacy unique; superseded by Prisma name)
--   • guardians_email_key            (extra unique not in Prisma; keep)
-- Do NOT drop these in Batch 2. Schedule a separate approved CONTRACT batch later.
-- #############################################################################
