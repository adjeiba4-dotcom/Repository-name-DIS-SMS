// services/reportCardTemplates/standardA4.js
// Professional A4 report card layout model (school branding, subjects, attendance, remarks, signatures).

const KEY = "STANDARD_A4";

function fullName(person) {
    if (!person) return "";
    return [person.firstName, person.otherName, person.lastName]
        .filter(Boolean)
        .join(" ");
}

function formatDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
}

/**
 * Build a print/PDF-ready layout model from a stored ReportCard (+ snapshot).
 * Future templates can reshape the same snapshot differently.
 */
function buildRenderModel(reportCard, options = {}) {
    const snapshot = reportCard.snapshot || {};
    const school = snapshot.school || {};
    const student = snapshot.student || reportCard.student || {};
    const academic = snapshot.academic || {};
    const subjects = Array.isArray(snapshot.subjects) ? snapshot.subjects : [];
    const attendance = snapshot.attendance || {};
    const summary = snapshot.summary || {};

    return {
        templateKey: KEY,
        pageSize: "A4",
        orientation: "portrait",
        meta: {
            reportCardId: reportCard.id,
            generatedAt: reportCard.generatedAt || reportCard.createdAt,
            workflowStatus: reportCard.workflowStatus,
            isPublished: reportCard.isPublished,
            isLocked: reportCard.isLocked,
            printedAt: options.printedAt || new Date().toISOString(),
        },
        header: {
            schoolName: school.schoolName || "School",
            schoolCode: school.schoolCode || null,
            motto: school.motto || null,
            address: [school.address, school.city, school.region, school.country]
                .filter(Boolean)
                .join(", "),
            phone: school.phone || null,
            email: school.email || null,
            website: school.website || null,
            logoUrl: school.logoUrl || null,
            stampUrl: school.stampUrl || null,
            title: "STUDENT REPORT CARD",
            academicYear: academic.academicYearName || reportCard.academicYear?.name || "",
            term: academic.termName || reportCard.term?.name || "",
        },
        student: {
            id: student.id || reportCard.studentId,
            fullName: fullName(student) || fullName(reportCard.student),
            admissionNo: student.admissionNo || reportCard.student?.admissionNo || "",
            gender: student.gender || reportCard.student?.gender || null,
            dateOfBirth: formatDate(student.dateOfBirth),
            className:
                academic.className ||
                reportCard.schoolClass?.className ||
                "",
            classCode:
                academic.classCode ||
                reportCard.schoolClass?.classCode ||
                "",
            photoUrl: student.photoUrl || null,
            classTeacherName: academic.classTeacherName || null,
        },
        subjects: subjects.map((row, index) => ({
            index: index + 1,
            subjectCode: row.subjectCode || "",
            subjectName: row.subjectName || "",
            caScore: row.caScore,
            examScore: row.examScore,
            finalScore: row.finalScore,
            grade: row.gradeLetter || row.grade || null,
            subjectPosition: row.subjectPosition,
            remarks: row.remarks || null,
            isPassed: Boolean(row.isPassed),
        })),
        summary: {
            subjectCount: summary.subjectCount ?? reportCard.subjectCount ?? subjects.length,
            totalScore: summary.totalScore ?? reportCard.totalScore,
            averageScore: summary.averageScore ?? reportCard.averageScore,
            overallGrade: summary.overallGrade ?? reportCard.overallGrade,
            classPosition: summary.classPosition ?? reportCard.classPosition,
            classAverage: summary.classAverage ?? null,
            passedCount: summary.passedCount ?? reportCard.passedCount,
            failedCount: summary.failedCount ?? reportCard.failedCount,
        },
        attendance: {
            daysPresent: attendance.daysPresent ?? reportCard.daysPresent,
            daysAbsent: attendance.daysAbsent ?? reportCard.daysAbsent,
            daysLate: attendance.daysLate ?? reportCard.daysLate,
            daysExcused: attendance.daysExcused ?? reportCard.daysExcused,
            totalDays: attendance.totalDays ?? null,
            attendancePercentage:
                attendance.attendancePercentage ?? reportCard.attendancePercentage,
        },
        remarks: {
            teacher:
                reportCard.teacherRemarks ||
                snapshot.remarks?.teacher ||
                null,
            headmaster:
                reportCard.headmasterRemarks ||
                snapshot.remarks?.headmaster ||
                null,
        },
        promotion: {
            decision: reportCard.promotionDecision || "PENDING",
            promoted: Boolean(reportCard.promoted),
            label: formatPromotionLabel(reportCard.promotionDecision, reportCard.promoted),
        },
        signatures: {
            classTeacher: {
                label: "Class Teacher",
                name: academic.classTeacherName || null,
                date: null,
            },
            headmaster: {
                label: "Headmaster / Principal",
                name: null,
                date: null,
            },
            parentGuardian: {
                label: "Parent / Guardian",
                name: null,
                date: null,
            },
        },
        footer: {
            brand: "DIS-SMS",
            confidentiality:
                "This is an official academic report. Unauthorized alteration is prohibited.",
            accreditationInfo: school.accreditationInfo || null,
        },
    };
}

function formatPromotionLabel(decision, promoted) {
    switch (String(decision || "").toUpperCase()) {
        case "PROMOTED":
            return "Promoted";
        case "PROMOTED_ON_PROBATION":
            return "Promoted on Probation";
        case "REPEAT":
            return "Repeat Class";
        case "GRADUATED":
            return "Graduated";
        case "WITHDRAWN":
            return "Withdrawn";
        case "TRANSFERRED":
            return "Transferred";
        case "CONDITIONAL":
            return "Promoted on Probation";
        case "DEFERRED":
            return "Pending Decision";
        case "PENDING":
        default:
            return promoted ? "Promoted" : "Pending Decision";
    }
}

module.exports = {
    key: KEY,
    name: "Standard A4",
    description:
        "Professional A4 portrait report card with school branding, subject table, attendance, remarks, and signature blocks.",
    pageSize: "A4",
    orientation: "portrait",
    buildRenderModel,
};
