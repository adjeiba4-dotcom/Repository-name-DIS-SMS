// services/enrollment.service.js

const enrollmentRepository = require("../repositories/enrollment.repository");

class EnrollmentService {
    async getEnrollments() {
        return await enrollmentRepository.findAllEnrollments();
    }

    async getEnrollmentById(id) {
        const enrollment =
            await enrollmentRepository.findEnrollmentById(id);

        if (!enrollment) {
            throw new Error("Enrollment not found.");
        }

        return enrollment;
    }

    async searchEnrollments(keyword) {
        return await enrollmentRepository.searchEnrollments(keyword);
    }

    async createEnrollment(data) {
        // Verify Student
        const student =
            await enrollmentRepository.findStudentById(
                data.studentId
            );

        if (!student) {
            throw new Error("Student not found.");
        }

        // Verify Academic Year
        const academicYear =
            await enrollmentRepository.findAcademicYearById(
                data.academicYearId
            );

        if (!academicYear) {
            throw new Error("Academic year not found.");
        }

        // Verify Class
        const schoolClass =
            await enrollmentRepository.findClassById(
                data.classId
            );

        if (!schoolClass) {
            throw new Error("School class not found.");
        }

        // Prevent duplicate enrollment
        const existingEnrollment =
            await enrollmentRepository.findEnrollment(
                data.studentId,
                data.academicYearId
            );

        if (existingEnrollment) {
            throw new Error(
                "Student is already enrolled for this academic year."
            );
        }

        return await enrollmentRepository.createEnrollment(data);
    }

    async updateEnrollment(id, data) {
        const enrollment =
            await enrollmentRepository.findEnrollmentById(id);

        if (!enrollment) {
            throw new Error("Enrollment not found.");
        }

        // Verify Student
        if (data.studentId) {
            const student =
                await enrollmentRepository.findStudentById(
                    data.studentId
                );

            if (!student) {
                throw new Error("Student not found.");
            }
        }

        // Verify Academic Year
        if (data.academicYearId) {
            const academicYear =
                await enrollmentRepository.findAcademicYearById(
                    data.academicYearId
                );

            if (!academicYear) {
                throw new Error("Academic year not found.");
            }
        }

        // Verify Class
        if (data.classId) {
            const schoolClass =
                await enrollmentRepository.findClassById(
                    data.classId
                );

            if (!schoolClass) {
                throw new Error("School class not found.");
            }
        }

        // Determine values after update
        const studentId =
            data.studentId !== undefined ?
            data.studentId :
            enrollment.studentId;

        const academicYearId =
            data.academicYearId !== undefined ?
            data.academicYearId :
            enrollment.academicYearId;

        // Check duplicate enrollment
        const duplicate =
            await enrollmentRepository.findEnrollment(
                studentId,
                academicYearId
            );

        if (duplicate && duplicate.id !== id) {
            throw new Error(
                "Student is already enrolled for this academic year."
            );
        }

        return await enrollmentRepository.updateEnrollment(
            id,
            data
        );
    }

    async deleteEnrollment(id) {
        const enrollment =
            await enrollmentRepository.findEnrollmentById(id);

        if (!enrollment) {
            throw new Error("Enrollment not found.");
        }

        return await enrollmentRepository.deleteEnrollment(id);
    }
}

module.exports = new EnrollmentService();