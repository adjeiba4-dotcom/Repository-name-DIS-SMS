-- Sprint 6.1: Academic Year status enum
-- MySQL already stores status as ENUM('ACTIVE','INACTIVE','ARCHIVED').
-- This migration documents the Prisma AcademicYearStatus type and keeps values intact.

ALTER TABLE `academic_years`
  MODIFY COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE';
