// services/teacherSubject.service.js

const teacherSubjectRepository = require("../repositories/teacherSubject.repository");

class TeacherSubjectService {
    async getTeacherSubjects() {
        return await teacherSubjectRepository.findAllTeacherSubjects();
    }

    async getTeacherSubjectById(id) {
        const assignment = await teacherSubjectRepository.findTeacherSubjectById(id);

        if (!assignment) {
            throw new Error("Teacher subject assignment not found.");
        }

        return assignment;
    }

    async searchTeacherSubjects(keyword) {
        return await teacherSubjectRepository.searchTeacherSubjects(keyword);
    }

    async createTeacherSubject(data) {
        // Verify Teacher
        const teacher = await teacherSubjectRepository.findTeacherById(
            data.teacherId
        );

        if (!teacher) {
            throw new Error("Teacher not found.");
        }

        // Verify Subject
        const subject = await teacherSubjectRepository.findSubjectById(
            data.subjectId
        );

        if (!subject) {
            throw new Error("Subject not found.");
        }

        // Prevent duplicate assignment
        const existingAssignment =
            await teacherSubjectRepository.findAssignment(
                data.teacherId,
                data.subjectId
            );

        if (existingAssignment) {
            throw new Error(
                "Teacher has already been assigned to this subject."
            );
        }

        return await teacherSubjectRepository.createTeacherSubject(data);
    }

    async updateTeacherSubject(id, data) {
        const assignment =
            await teacherSubjectRepository.findTeacherSubjectById(id);

        if (!assignment) {
            throw new Error("Teacher subject assignment not found.");
        }

        // Verify Teacher
        if (data.teacherId) {
            const teacher =
                await teacherSubjectRepository.findTeacherById(
                    data.teacherId
                );

            if (!teacher) {
                throw new Error("Teacher not found.");
            }
        }

        // Verify Subject
        if (data.subjectId) {
            const subject =
                await teacherSubjectRepository.findSubjectById(
                    data.subjectId
                );

            if (!subject) {
                throw new Error("Subject not found.");
            }
        }

        // Use existing values if not supplied
        const teacherId =
            data.teacherId !== undefined ?
            data.teacherId :
            assignment.teacherId;

        const subjectId =
            data.subjectId !== undefined ?
            data.subjectId :
            assignment.subjectId;

        // Prevent duplicate assignment
        const duplicate =
            await teacherSubjectRepository.findAssignment(
                teacherId,
                subjectId
            );

        if (duplicate && duplicate.id !== id) {
            throw new Error(
                "Teacher has already been assigned to this subject."
            );
        }

        return await teacherSubjectRepository.updateTeacherSubject(
            id,
            data
        );
    }

    async deleteTeacherSubject(id) {
        const assignment =
            await teacherSubjectRepository.findTeacherSubjectById(id);

        if (!assignment) {
            throw new Error("Teacher subject assignment not found.");
        }

        return await teacherSubjectRepository.deleteTeacherSubject(id);
    }
}

module.exports = new TeacherSubjectService();