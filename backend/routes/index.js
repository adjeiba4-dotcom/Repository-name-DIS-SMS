const express = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const studentRoutes = require("./student.routes");
const teacherRoutes = require("./teacher.routes");
const departmentRoutes = require("./department.routes");
const classRoutes = require("./class.routes");
const subjectRoutes = require("./subject.routes");
const academicYearRoutes = require("./academicYear.routes");
const termRoutes = require("./term.routes");
const enrollmentRoutes = require("./enrollment.routes");
const attendanceRoutes = require("./attendance.routes");
const examinationRoutes = require("./examination.routes");
const resultRoutes = require("./result.routes");
const feeRoutes = require("./fee.routes");
const paymentRoutes = require("./payment.routes");
const announcementRoutes = require("./announcement.routes");
const eventRoutes = require("./event.routes");
const notificationRoutes = require("./notification.routes");
const auditRoutes = require("./audit.routes");
const dashboardRoutes = require("./dashboard.routes");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to DIS-SMS API v1",
    });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/departments", departmentRoutes);
router.use("/classes", classRoutes);
router.use("/subjects", subjectRoutes);
router.use("/academic-years", academicYearRoutes);
router.use("/terms", termRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/examinations", examinationRoutes);
router.use("/results", resultRoutes);
router.use("/fees", feeRoutes);
router.use("/payments", paymentRoutes);
router.use("/announcements", announcementRoutes);
router.use("/events", eventRoutes);
router.use("/notifications", notificationRoutes);
router.use("/audit-logs", auditRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;