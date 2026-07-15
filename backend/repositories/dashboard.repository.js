const db = require("../database/db");

exports.getDashboardStatistics = async() => {
    const [
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalPayments,
        totalFees,
        totalAnnouncements,
        totalEvents,
        totalNotifications,
    ] = await Promise.all([
        db.student.count(),
        db.teacher.count(),
        db.class.count(),
        db.subject.count(),
        db.payment.count(),
        db.fee.count(),
        db.announcement.count(),
        db.event.count(),
        db.notification.count(),
    ]);

    const totalRevenue = await db.payment.aggregate({
        _sum: {
            amountPaid: true,
        },
    });

    const averageResult = await db.result.aggregate({
        _avg: {
            marksObtained: true,
        },
    });

    return {
        schoolOverview: {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSubjects,
        },

        finance: {
            totalFees,
            totalPayments,
            totalRevenue: totalRevenue._sum.amountPaid || 0,
        },

        academics: {
            averageScore: averageResult._avg.marksObtained || 0,
        },

        communication: {
            totalAnnouncements,
            totalEvents,
            totalNotifications,
        },
    };
};