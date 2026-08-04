// services/teacher.service.js

const teacherRepository = require("../repositories/teacher.repository");
const {
    NotFoundError,
    ConflictError,
} = require("../errors");

const TEACHER_FIELDS = [
    "staffNo",
    "firstName",
    "lastName",
    "gender",
    "email",
    "phone",
    "address",
    "qualification",
    "employmentDate",
    "departmentId",
    "status",
];

function sanitizeTeacherData(data = {}) {
    const payload = {};

    for (const field of TEACHER_FIELDS) {
        if (data[field] === undefined) continue;
        if (data[field] === "") continue;
        payload[field] = data[field];
    }

    if (payload.departmentId != null) {
        payload.departmentId = Number(payload.departmentId);
    }

    return payload;
}

class TeacherService {
    async getTeachers() {
        return await teacherRepository.findAllTeachers();
    }

    async getTeacherById(id) {
        const teacher = await teacherRepository.findTeacherById(id);

        if (!teacher) {
            throw new NotFoundError("Teacher not found.");
        }

        return teacher;
    }

    async searchTeachers(keyword) {
        return await teacherRepository.searchTeachers(keyword);
    }

    async getArchivedTeachers() {
        return await teacherRepository.findArchivedTeachers();
    }

    async createTeacher(rawData) {
        const data = sanitizeTeacherData(rawData);

        // Validate department
        const department = await teacherRepository.findDepartmentById(
            data.departmentId
        );

        if (!department) {
            throw new NotFoundError("Department not found.");
        }

        // Validate staff number
        const existingStaffNo =
            await teacherRepository.findTeacherByStaffNo(
                data.staffNo
            );

        if (existingStaffNo) {
            throw new ConflictError(
                "Staff number already exists."
            );
        }

        // Validate email
        if (data.email) {
            const existingEmail =
                await teacherRepository.findTeacherByEmail(
                    data.email
                );

            if (existingEmail) {
                throw new ConflictError(
                    "Email address already exists."
                );
            }
        }

        return await teacherRepository.createTeacher(data);
    }

    async updateTeacher(id, rawData) {
        const data = sanitizeTeacherData(rawData);
        const teacher =
            await teacherRepository.findTeacherById(id);

        if (!teacher) {
            throw new NotFoundError("Teacher not found.");
        }

        // Validate department
        if (data.departmentId) {
            const department =
                await teacherRepository.findDepartmentById(
                    data.departmentId
                );

            if (!department) {
                throw new NotFoundError(
                    "Department not found."
                );
            }
        }

        // Validate staff number
        if (data.staffNo) {
            const duplicateStaffNo =
                await teacherRepository.findTeacherByStaffNo(
                    data.staffNo
                );

            if (
                duplicateStaffNo &&
                duplicateStaffNo.id !== id
            ) {
                throw new ConflictError(
                    "Staff number already exists."
                );
            }
        }

        // Validate email
        if (data.email) {
            const duplicateEmail =
                await teacherRepository.findTeacherByEmail(
                    data.email
                );

            if (
                duplicateEmail &&
                duplicateEmail.id !== id
            ) {
                throw new ConflictError(
                    "Email address already exists."
                );
            }
        }

        return await teacherRepository.updateTeacher(
            id,
            data
        );
    }

    async deleteTeacher(id) {
        const teacher =
            await teacherRepository.findTeacherById(id);

        if (!teacher) {
            throw new NotFoundError("Teacher not found.");
        }

        return await teacherRepository.softDeleteTeacher(id);
    }

    async restoreTeacher(id) {
        const teacher =
            await teacherRepository.findArchivedTeacherById(
                id
            );

        if (!teacher) {
            throw new NotFoundError(
                "Archived teacher not found."
            );
        }

        return await teacherRepository.restoreTeacher(id);
    }
}

module.exports = new TeacherService();