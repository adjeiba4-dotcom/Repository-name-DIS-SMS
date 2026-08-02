/*
  Warnings:

  - You are about to drop the column `content` on the `announcements` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `announcements` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `announcements` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `schoolClassId` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `eventDate` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `examinations` table. All the data in the column will be lost.
  - You are about to drop the column `passMarks` on the `examinations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `examinations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `examinations` table. All the data in the column will be lost.
  - You are about to alter the column `totalMarks` on the `examinations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Int`.
  - You are about to drop the column `deletedAt` on the `fee_structures` table. All the data in the column will be lost.
  - You are about to drop the column `schoolClassId` on the `fee_structures` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `fee_structures` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(12,2)`.
  - You are about to drop the column `deletedAt` on the `fee_types` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `amountAllocated` on the `payment_allocations` table. All the data in the column will be lost.
  - You are about to drop the column `studentInvoiceId` on the `payment_allocations` table. All the data in the column will be lost.
  - You are about to drop the column `receiptNumber` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `transactionRef` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `payments` table. All the data in the column will be lost.
  - You are about to alter the column `paymentMethod` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `VarChar(191)`.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(12,2)`.
  - You are about to drop the column `createdAt` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `printed` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `receipts` table. All the data in the column will be lost.
  - You are about to drop the column `marksObtained` on the `results` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `results` table. All the data in the column will be lost.
  - You are about to drop the column `amountPaid` on the `student_invoices` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `student_invoices` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `student_invoices` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(12,2)`.
  - You are about to alter the column `balance` on the `student_invoices` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(12,2)`.
  - You are about to alter the column `status` on the `student_invoices` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(12))` to `Enum(EnumId(40))`.
  - You are about to drop the column `address` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[academicYearId,classId,feeTypeId]` on the table `fee_structures` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `guardians` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId,invoiceId]` on the table `payment_allocations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiptNo]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[invoiceNo]` on the table `student_invoices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `announcements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `announcements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `enrollments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizerId` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `fee_structures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountApplied` to the `payment_allocations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceId` to the `payment_allocations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptNo` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marks` to the `results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `student_invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceDate` to the `student_invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceNo` to the `student_invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `students` table without a default value. This is not possible if the table is not empty.
  - Made the column `dateOfBirth` on table `students` required. This step will fail if there are existing NULL values in that column.
  - Made the column `guardianId` on table `students` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_academicYearId_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_termId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollments` DROP FOREIGN KEY `enrollments_academicYearId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollments` DROP FOREIGN KEY `enrollments_schoolClassId_fkey`;

-- DropForeignKey
ALTER TABLE `enrollments` DROP FOREIGN KEY `enrollments_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `fee_structures` DROP FOREIGN KEY `fee_structures_feeTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `fee_structures` DROP FOREIGN KEY `fee_structures_schoolClassId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_userId_fkey`;

-- DropForeignKey
ALTER TABLE `payment_allocations` DROP FOREIGN KEY `payment_allocations_paymentId_fkey`;

-- DropForeignKey
ALTER TABLE `payment_allocations` DROP FOREIGN KEY `payment_allocations_studentInvoiceId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `receipts` DROP FOREIGN KEY `receipts_paymentId_fkey`;

-- DropForeignKey
ALTER TABLE `results` DROP FOREIGN KEY `results_examinationId_fkey`;

-- DropForeignKey
ALTER TABLE `results` DROP FOREIGN KEY `results_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `student_invoices` DROP FOREIGN KEY `student_invoices_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_guardianId_fkey`;

-- DropIndex
DROP INDEX `announcements_publishDate_idx` ON `announcements`;

-- DropIndex
DROP INDEX `attendance_academicYearId_idx` ON `attendance`;

-- DropIndex
DROP INDEX `attendance_studentId_idx` ON `attendance`;

-- DropIndex
DROP INDEX `attendance_termId_idx` ON `attendance`;

-- DropIndex
DROP INDEX `enrollments_academicYearId_idx` ON `enrollments`;

-- DropIndex
DROP INDEX `enrollments_schoolClassId_idx` ON `enrollments`;

-- DropIndex
DROP INDEX `enrollments_studentId_idx` ON `enrollments`;

-- DropIndex
DROP INDEX `events_eventDate_idx` ON `events`;

-- DropIndex
DROP INDEX `fee_structures_feeTypeId_schoolClassId_academicYearId_key` ON `fee_structures`;

-- DropIndex
DROP INDEX `fee_structures_schoolClassId_idx` ON `fee_structures`;

-- DropIndex
DROP INDEX `notifications_isRead_idx` ON `notifications`;

-- DropIndex
DROP INDEX `payment_allocations_paymentId_idx` ON `payment_allocations`;

-- DropIndex
DROP INDEX `payment_allocations_paymentId_studentInvoiceId_key` ON `payment_allocations`;

-- DropIndex
DROP INDEX `payment_allocations_studentInvoiceId_idx` ON `payment_allocations`;

-- DropIndex
DROP INDEX `payments_receiptNumber_key` ON `payments`;

-- DropIndex
DROP INDEX `payments_studentId_idx` ON `payments`;

-- DropIndex
DROP INDEX `results_examinationId_idx` ON `results`;

-- DropIndex
DROP INDEX `results_studentId_idx` ON `results`;

-- DropIndex
DROP INDEX `students_email_key` ON `students`;

-- AlterTable
ALTER TABLE `announcements` DROP COLUMN `content`,
    DROP COLUMN `deletedAt`,
    DROP COLUMN `isPublished`,
    ADD COLUMN `createdBy` INTEGER NOT NULL,
    ADD COLUMN `message` TEXT NOT NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    ALTER COLUMN `publishDate` DROP DEFAULT;

-- AlterTable
ALTER TABLE `attendance` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `enrollments` DROP COLUMN `schoolClassId`,
    ADD COLUMN `classId` INTEGER NOT NULL,
    ALTER COLUMN `enrollmentDate` DROP DEFAULT;

-- AlterTable
ALTER TABLE `events` DROP COLUMN `deletedAt`,
    DROP COLUMN `endTime`,
    DROP COLUMN `eventDate`,
    DROP COLUMN `startTime`,
    ADD COLUMN `endDate` DATETIME(3) NOT NULL,
    ADD COLUMN `organizerId` INTEGER NOT NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `examinations` DROP COLUMN `deletedAt`,
    DROP COLUMN `passMarks`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    MODIFY `totalMarks` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `fee_structures` DROP COLUMN `deletedAt`,
    DROP COLUMN `schoolClassId`,
    ADD COLUMN `classId` INTEGER NOT NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `fee_types` DROP COLUMN `deletedAt`,
    ADD COLUMN `mandatory` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `isRead`,
    ADD COLUMN `announcementId` INTEGER NULL,
    ADD COLUMN `sentAt` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'SENT', 'FAILED', 'READ') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `studentId` INTEGER NULL,
    MODIFY `userId` INTEGER NULL,
    ALTER COLUMN `type` DROP DEFAULT;

-- AlterTable
ALTER TABLE `payment_allocations` DROP COLUMN `amountAllocated`,
    DROP COLUMN `studentInvoiceId`,
    ADD COLUMN `amountApplied` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `invoiceId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `receiptNumber`,
    DROP COLUMN `status`,
    DROP COLUMN `transactionRef`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `receiptNo` VARCHAR(191) NOT NULL,
    ADD COLUMN `referenceNo` VARCHAR(191) NULL,
    ALTER COLUMN `paymentDate` DROP DEFAULT,
    MODIFY `paymentMethod` VARCHAR(191) NOT NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL;

-- AlterTable
ALTER TABLE `receipts` DROP COLUMN `createdAt`,
    DROP COLUMN `printed`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `printedBy` INTEGER NULL,
    ADD COLUMN `remarks` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `results` DROP COLUMN `marksObtained`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `marks` DECIMAL(5, 2) NOT NULL;

-- AlterTable
ALTER TABLE `role_permissions` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `school_classes` ADD COLUMN `description` VARCHAR(191) NULL,
    MODIFY `level` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `student_invoices` DROP COLUMN `amountPaid`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `dueDate` DATETIME(3) NOT NULL,
    ADD COLUMN `invoiceDate` DATETIME(3) NOT NULL,
    ADD COLUMN `invoiceNo` VARCHAR(191) NOT NULL,
    MODIFY `amount` DECIMAL(12, 2) NOT NULL,
    MODIFY `balance` DECIMAL(12, 2) NOT NULL,
    MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `students` DROP COLUMN `address`,
    DROP COLUMN `email`,
    DROP COLUMN `phone`,
    ADD COLUMN `classId` INTEGER NOT NULL,
    MODIFY `dateOfBirth` DATETIME(3) NOT NULL,
    MODIFY `guardianId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `sms_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipient` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('QUEUED', 'SENT', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `provider` VARCHAR(191) NULL,
    `response` TEXT NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recipient` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `status` ENUM('QUEUED', 'SENT', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `provider` VARCHAR(191) NULL,
    `response` TEXT NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `book_categories_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `biography` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `publishers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `books` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isbn` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `edition` VARCHAR(191) NULL,
    `publishYear` INTEGER NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `availableQty` INTEGER NOT NULL DEFAULT 1,
    `shelfLocation` VARCHAR(191) NULL,
    `categoryId` INTEGER NOT NULL,
    `authorId` INTEGER NOT NULL,
    `publisherId` INTEGER NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `books_isbn_key`(`isbn`),
    INDEX `books_categoryId_idx`(`categoryId`),
    INDEX `books_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book_borrowings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `bookId` INTEGER NOT NULL,
    `borrowedDate` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `returnedDate` DATETIME(3) NULL,
    `fineAmount` DECIMAL(10, 2) NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `book_borrowings_studentId_idx`(`studentId`),
    INDEX `book_borrowings_bookId_idx`(`bookId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `contactPerson` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `taxNumber` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `suppliers_supplierCode_key`(`supplierCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemCode` VARCHAR(191) NOT NULL,
    `itemName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `minimumStock` INTEGER NOT NULL DEFAULT 0,
    `currentStock` INTEGER NOT NULL DEFAULT 0,
    `unitCost` DECIMAL(12, 2) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_items_itemCode_key`(`itemCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseNumber` VARCHAR(191) NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `purchaseDate` DATETIME(3) NOT NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchases_purchaseNumber_key`(`purchaseNumber`),
    INDEX `purchases_supplierId_idx`(`supplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(12, 2) NOT NULL,
    `totalPrice` DECIMAL(12, 2) NOT NULL,

    INDEX `purchase_items_purchaseId_idx`(`purchaseId`),
    INDEX `purchase_items_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_movements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `movementType` ENUM('PURCHASE', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'TRANSFER') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `referenceNo` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `movementDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stock_movements_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_issues` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `issueNumber` VARCHAR(191) NOT NULL,
    `issuedTo` VARCHAR(191) NOT NULL,
    `departmentId` INTEGER NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `stock_issues_issueNumber_key`(`issueNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_issue_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stockIssueId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    INDEX `stock_issue_items_stockIssueId_idx`(`stockIssueId`),
    INDEX `stock_issue_items_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeNo` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `otherName` VARCHAR(191) NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `employmentType` ENUM('PERMANENT', 'CONTRACT', 'TEMPORARY', 'PART_TIME', 'INTERN') NOT NULL,
    `departmentId` INTEGER NULL,
    `hireDate` DATETIME(3) NOT NULL,
    `basicSalary` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employees_employeeNo_key`(`employeeNo`),
    UNIQUE INDEX `employees_email_key`(`email`),
    INDEX `employees_departmentId_idx`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payrolls` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payrollNumber` VARCHAR(191) NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `payPeriod` VARCHAR(191) NOT NULL,
    `basicSalary` DECIMAL(12, 2) NOT NULL,
    `allowance` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `deduction` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `netSalary` DECIMAL(12, 2) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payrolls_payrollNumber_key`(`payrollNumber`),
    INDEX `payrolls_employeeId_idx`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_types` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `maxDays` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `leave_types_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leave_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `leaveTypeId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `totalDays` INTEGER NOT NULL,
    `reason` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `approvedBy` INTEGER NULL,
    `approvedDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `leave_requests_employeeId_idx`(`employeeId`),
    INDEX `leave_requests_leaveTypeId_idx`(`leaveTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employee_attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `attendanceDate` DATETIME(3) NOT NULL,
    `checkIn` DATETIME(3) NULL,
    `checkOut` DATETIME(3) NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE') NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `employee_attendance_employeeId_idx`(`employeeId`),
    UNIQUE INDEX `employee_attendance_employeeId_attendanceDate_key`(`employeeId`, `attendanceDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleNumber` VARCHAR(191) NOT NULL,
    `registrationNo` VARCHAR(191) NOT NULL,
    `make` VARCHAR(191) NULL,
    `model` VARCHAR(191) NULL,
    `year` INTEGER NULL,
    `capacity` INTEGER NOT NULL,
    `insuranceExpiry` DATETIME(3) NULL,
    `roadworthyExpiry` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicles_vehicleNumber_key`(`vehicleNumber`),
    UNIQUE INDEX `vehicles_registrationNo_key`(`registrationNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `drivers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NULL,
    `licenseNumber` VARCHAR(191) NOT NULL,
    `licenseExpiry` DATETIME(3) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `drivers_employeeId_key`(`employeeId`),
    UNIQUE INDEX `drivers_licenseNumber_key`(`licenseNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transport_routes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `routeCode` VARCHAR(191) NOT NULL,
    `routeName` VARCHAR(191) NOT NULL,
    `pickupLocation` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `distanceKm` DECIMAL(8, 2) NULL,
    `fare` DECIMAL(10, 2) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transport_routes_routeCode_key`(`routeCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `driver_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `driverId` INTEGER NOT NULL,
    `vehicleId` INTEGER NOT NULL,
    `assignedDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,

    UNIQUE INDEX `driver_assignments_driverId_vehicleId_assignedDate_key`(`driverId`, `vehicleId`, `assignedDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `route_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` INTEGER NOT NULL,
    `routeId` INTEGER NOT NULL,
    `effectiveDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,

    UNIQUE INDEX `route_assignments_vehicleId_routeId_effectiveDate_key`(`vehicleId`, `routeId`, `effectiveDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_transport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `routeId` INTEGER NOT NULL,
    `pickupPoint` VARCHAR(191) NULL,
    `dropOffPoint` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `student_transport_studentId_idx`(`studentId`),
    INDEX `student_transport_routeId_idx`(`routeId`),
    UNIQUE INDEX `student_transport_studentId_routeId_startDate_key`(`studentId`, `routeId`, `startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hostels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hostelCode` VARCHAR(191) NOT NULL,
    `hostelName` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `totalRooms` INTEGER NOT NULL,
    `capacity` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hostels_hostelCode_key`(`hostelCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hostel_rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hostelId` INTEGER NOT NULL,
    `roomNumber` VARCHAR(191) NOT NULL,
    `floor` INTEGER NULL,
    `capacity` INTEGER NOT NULL,
    `occupiedBeds` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hostel_rooms_hostelId_roomNumber_key`(`hostelId`, `roomNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hostel_beds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `bedNumber` VARCHAR(191) NOT NULL,
    `occupied` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `hostel_beds_roomId_bedNumber_key`(`roomId`, `bedNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bed_allocations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `bedId` INTEGER NOT NULL,
    `allocationDate` DATETIME(3) NOT NULL,
    `checkoutDate` DATETIME(3) NULL,
    `academicYearId` INTEGER NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `bed_allocations_bedId_idx`(`bedId`),
    UNIQUE INDEX `bed_allocations_studentId_academicYearId_key`(`studentId`, `academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hostel_inspections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `inspectionDate` DATETIME(3) NOT NULL,
    `inspectedBy` INTEGER NOT NULL,
    `cleanliness` INTEGER NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `hostel_inspections_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dashboards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dashboards_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dashboard_widgets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dashboardId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `widgetType` VARCHAR(191) NOT NULL,
    `dataSource` VARCHAR(191) NOT NULL,
    `positionX` INTEGER NOT NULL,
    `positionY` INTEGER NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `configuration` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `dashboard_widgets_dashboardId_idx`(`dashboardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportCode` VARCHAR(191) NOT NULL,
    `reportName` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sqlQuery` TEXT NULL,
    `createdBy` INTEGER NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reports_reportCode_key`(`reportCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_executions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reportId` INTEGER NOT NULL,
    `executedBy` INTEGER NOT NULL,
    `executionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fileName` VARCHAR(191) NULL,
    `fileFormat` VARCHAR(191) NULL,
    `executionTimeMs` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,

    INDEX `report_executions_reportId_idx`(`reportId`),
    INDEX `report_executions_executedBy_idx`(`executedBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_backups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `backupName` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `backupType` VARCHAR(191) NOT NULL,
    `fileSize` BIGINT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `level` VARCHAR(191) NOT NULL,
    `module` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `userId` INTEGER NULL,
    `loggedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `system_logs_userId_idx`(`userId`),
    INDEX `system_logs_loggedAt_idx`(`loggedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `announcements_createdBy_idx` ON `announcements`(`createdBy`);

-- CreateIndex
CREATE INDEX `enrollments_classId_idx` ON `enrollments`(`classId`);

-- CreateIndex
CREATE INDEX `events_organizerId_idx` ON `events`(`organizerId`);

-- CreateIndex
CREATE UNIQUE INDEX `fee_structures_academicYearId_classId_feeTypeId_key` ON `fee_structures`(`academicYearId`, `classId`, `feeTypeId`);

-- CreateIndex
CREATE UNIQUE INDEX `guardians_email_key` ON `guardians`(`email`);

-- CreateIndex
CREATE INDEX `notifications_studentId_idx` ON `notifications`(`studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `payment_allocations_paymentId_invoiceId_key` ON `payment_allocations`(`paymentId`, `invoiceId`);

-- CreateIndex
CREATE UNIQUE INDEX `payments_receiptNo_key` ON `payments`(`receiptNo`);

-- CreateIndex
CREATE UNIQUE INDEX `student_invoices_invoiceNo_key` ON `student_invoices`(`invoiceNo`);

-- CreateIndex
CREATE INDEX `students_classId_idx` ON `students`(`classId`);

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_guardianId_fkey` FOREIGN KEY (`guardianId`) REFERENCES `guardians`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `school_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `school_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_termId_fkey` FOREIGN KEY (`termId`) REFERENCES `terms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `results` ADD CONSTRAINT `results_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `results` ADD CONSTRAINT `results_examinationId_fkey` FOREIGN KEY (`examinationId`) REFERENCES `examinations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_structures` ADD CONSTRAINT `fee_structures_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `school_classes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_invoices` ADD CONSTRAINT `student_invoices_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_allocations` ADD CONSTRAINT `payment_allocations_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_allocations` ADD CONSTRAINT `payment_allocations_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `student_invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_announcementId_fkey` FOREIGN KEY (`announcementId`) REFERENCES `announcements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_organizerId_fkey` FOREIGN KEY (`organizerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `book_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `books` ADD CONSTRAINT `books_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `publishers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_borrowings` ADD CONSTRAINT `book_borrowings_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `book_borrowings` ADD CONSTRAINT `book_borrowings_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_items` ADD CONSTRAINT `purchase_items_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_items` ADD CONSTRAINT `purchase_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_issues` ADD CONSTRAINT `stock_issues_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_issue_items` ADD CONSTRAINT `stock_issue_items_stockIssueId_fkey` FOREIGN KEY (`stockIssueId`) REFERENCES `stock_issues`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_issue_items` ADD CONSTRAINT `stock_issue_items_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventory_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payrolls` ADD CONSTRAINT `payrolls_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `leave_requests` ADD CONSTRAINT `leave_requests_leaveTypeId_fkey` FOREIGN KEY (`leaveTypeId`) REFERENCES `leave_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `employee_attendance` ADD CONSTRAINT `employee_attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `driver_assignments` ADD CONSTRAINT `driver_assignments_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `driver_assignments` ADD CONSTRAINT `driver_assignments_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `route_assignments` ADD CONSTRAINT `route_assignments_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `route_assignments` ADD CONSTRAINT `route_assignments_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `transport_routes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_transport` ADD CONSTRAINT `student_transport_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_transport` ADD CONSTRAINT `student_transport_routeId_fkey` FOREIGN KEY (`routeId`) REFERENCES `transport_routes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostel_rooms` ADD CONSTRAINT `hostel_rooms_hostelId_fkey` FOREIGN KEY (`hostelId`) REFERENCES `hostels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostel_beds` ADD CONSTRAINT `hostel_beds_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `hostel_rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bed_allocations` ADD CONSTRAINT `bed_allocations_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bed_allocations` ADD CONSTRAINT `bed_allocations_bedId_fkey` FOREIGN KEY (`bedId`) REFERENCES `hostel_beds`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bed_allocations` ADD CONSTRAINT `bed_allocations_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostel_inspections` ADD CONSTRAINT `hostel_inspections_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `hostel_rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hostel_inspections` ADD CONSTRAINT `hostel_inspections_inspectedBy_fkey` FOREIGN KEY (`inspectedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dashboards` ADD CONSTRAINT `dashboards_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dashboard_widgets` ADD CONSTRAINT `dashboard_widgets_dashboardId_fkey` FOREIGN KEY (`dashboardId`) REFERENCES `dashboards`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_executions` ADD CONSTRAINT `report_executions_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `reports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_executions` ADD CONSTRAINT `report_executions_executedBy_fkey` FOREIGN KEY (`executedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_backups` ADD CONSTRAINT `system_backups_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `system_logs` ADD CONSTRAINT `system_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `subjects` RENAME INDEX `subjects_schoolClassId_fkey` TO `subjects_schoolClassId_idx`;
