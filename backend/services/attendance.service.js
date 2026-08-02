// services/attendance.service.js

const attendanceRepository = require("../repositories/attendance.repository");

class AttendanceService {
    async getAttendance() {
        return await attendanceRepository.findAllAttendance();
    }

    async getAttendanceById(id) {
        const attendance =
            await attendanceRepository.findAttendanceById(id);

        if (!attendance) {
            throw new Error("Attendance record not found.");
        }

        return attendance;
    }

    async searchAttendance(keyword) {
        return await attendanceRepository.searchAttendance(keyword);
    }

    async createAttendance(data) {
        // Verify Student
        const student =
            await attendanceRepository.findStudentById(
                data.studentId
            );

        if (!student) {
            throw new Error("Student not found.");
        }

        // Verify Academic Year
        const academicYear =
            await attendanceRepository.findAcademicYearById(
                data.academicYearId
            );

        if (!academicYear) {
            throw new Error("Academic year not found.");
        }

        // Verify Term
        const term =
            await attendanceRepository.findTermById(
                data.termId
            );

        if (!term) {
            throw new Error("Term not found.");
        }

        // Prevent duplicate attendance
        const existingAttendance =
            await attendanceRepository.findAttendance(
                data.studentId,
                data.attendanceDate
            );

        if (existingAttendance) {
            throw new Error(
                "Attendance has already been recorded for this student on the selected date."
            );
        }

        return await attendanceRepository.createAttendance(data);
    }

    async updateAttendance(id, data) {
        const attendance =
            await attendanceRepository.findAttendanceById(id);

        if (!attendance) {
            throw new Error("Attendance record not found.");
        }

        // Verify Student
        if (data.studentId) {
            const student =
                await attendanceRepository.findStudentById(
                    data.studentId
                );

            if (!student) {
                throw new Error("Student not found.");
            }
        }

        // Verify Academic Year
        if (data.academicYearId) {
            const academicYear =
                await attendanceRepository.findAcademicYearById(
                    data.academicYearId
                );

            if (!academicYear) {
                throw new Error("Academic year not found.");
            }
        }

        // Verify Term
        if (data.termId) {
            const term =
                await attendanceRepository.findTermById(
                    data.termId
                );

            if (!term) {
                throw new Error("Term not found.");
            }
        }

        // Use existing values if not supplied
        const studentId =
            data.studentId !== undefined ?
            data.studentId :
            attendance.studentId;

        const attendanceDate =
            data.attendanceDate !== undefined ?
            data.attendanceDate :
            attendance.attendanceDate;

        // Prevent duplicate attendance
        const duplicate =
            await attendanceRepository.findAttendance(
                studentId,
                attendanceDate
            );

        if (duplicate && duplicate.id !== id) {
            throw new Error(
                "Attendance has already been recorded for this student on the selected date."
            );
        }

        return await attendanceRepository.updateAttendance(
            id,
            data
        );
    }

    async deleteAttendance(id) {
        const attendance =
            await attendanceRepository.findAttendanceById(id);

        if (!attendance) {
            throw new Error("Attendance record not found.");
        }

        return await attendanceRepository.deleteAttendance(id);
    }
}

module.exports = new AttendanceService();