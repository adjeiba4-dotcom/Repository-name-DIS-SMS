// routes/index.js

const express = require("express");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/
const authRoutes = require("./auth.routes");

/*
|--------------------------------------------------------------------------
| User & Security
|--------------------------------------------------------------------------
*/
const userRoutes = require("./user.routes");
const roleRoutes = require("./role.routes");
const auditRoutes = require("./audit.routes");

/*
|--------------------------------------------------------------------------
| Academic Management
|--------------------------------------------------------------------------
*/
const studentRoutes = require("./student.routes");
const guardianRoutes = require("./guardian.routes");
const departmentRoutes = require("./department.routes");
const classRoutes = require("./class.routes");
const academicYearRoutes = require("./academicYear.routes");
const termRoutes = require("./term.routes");
const subjectRoutes = require("./subject.routes");
const teacherRoutes = require("./teacher.routes");
const teacherSubjectRoutes = require("./teacherSubject.routes");
const enrollmentRoutes = require("./enrollment.routes");
const attendanceRoutes = require("./attendance.routes");
const examinationRoutes = require("./examination.routes");
const resultRoutes = require("./result.routes");
const reportCardRoutes = require("./reportCard.routes");
const studentPromotionRoutes = require("./studentPromotion.routes");
const timetableRoutes = require("./timetable.routes");

/*
|--------------------------------------------------------------------------
| Finance
|--------------------------------------------------------------------------
*/
const feeTypeRoutes = require("./feeType.routes");
const feeStructureRoutes = require("./feeStructure.routes");
const studentInvoiceRoutes = require("./studentInvoice.routes");
const paymentRoutes = require("./payment.routes");
const paymentAllocationRoutes = require("./paymentAllocation.routes");
const receiptRoutes = require("./receipt.routes");

/*
|--------------------------------------------------------------------------
| Communication
|--------------------------------------------------------------------------
*/
const announcementRoutes = require("./announcement.routes");
const notificationRoutes = require("./notification.routes");
const eventRoutes = require("./event.routes");

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/
const dashboardRoutes = require("./dashboard.routes");
const dashboardWidgetRoutes = require("./dashboardWidget.routes");

/*
|--------------------------------------------------------------------------
| System
|--------------------------------------------------------------------------
*/
const settingsRoutes = require("./settings.routes");

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/
router.use("/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| User & Security
|--------------------------------------------------------------------------
*/
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/audits", auditRoutes);

/*
|--------------------------------------------------------------------------
| Academic Management
|--------------------------------------------------------------------------
*/
router.use("/students", studentRoutes);
router.use("/guardians", guardianRoutes);
router.use("/departments", departmentRoutes);
router.use("/classes", classRoutes);
router.use("/academic-years", academicYearRoutes);
router.use("/terms", termRoutes);
router.use("/subjects", subjectRoutes);
router.use("/teachers", teacherRoutes);
router.use("/teacher-subjects", teacherSubjectRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/examinations", examinationRoutes);
router.use("/results", resultRoutes);
router.use("/report-cards", reportCardRoutes);
router.use("/student-promotions", studentPromotionRoutes);
router.use("/timetables", timetableRoutes);

/*
|--------------------------------------------------------------------------
| Finance
|--------------------------------------------------------------------------
*/
router.use("/fee-types", feeTypeRoutes);
router.use("/fee-structures", feeStructureRoutes);
router.use("/student-invoices", studentInvoiceRoutes);
router.use("/payments", paymentRoutes);
router.use("/payment-allocations", paymentAllocationRoutes);
router.use("/receipts", receiptRoutes);

/*
|--------------------------------------------------------------------------
| Communication
|--------------------------------------------------------------------------
*/
router.use("/announcements", announcementRoutes);
router.use("/notifications", notificationRoutes);
router.use("/events", eventRoutes);

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/
router.use("/dashboards", dashboardRoutes);
router.use("/dashboard-widgets", dashboardWidgetRoutes);

/*
|--------------------------------------------------------------------------
| System
|--------------------------------------------------------------------------
*/
router.use("/settings", settingsRoutes);

module.exports = router;