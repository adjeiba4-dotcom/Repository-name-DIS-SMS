const teacherRepository = require("../repositories/teacher.repository");

exports.getTeachers = async(search = "") => {
    return await teacherRepository.findAllTeachers(search);
};

exports.getTeacherById = async(id) => {
    const teacher = await teacherRepository.findTeacherById(id);

    if (!teacher) {
        throw new Error("Teacher not found.");
    }

    return teacher;
};

exports.createTeacher = async(teacherData) => {
    const existingTeacher = await teacherRepository.findTeacherByEmail(
        teacherData.email
    );

    if (existingTeacher) {
        throw new Error("Email already exists.");
    }

    return await teacherRepository.createTeacher(teacherData);
};

exports.updateTeacher = async(id, teacherData) => {
    const existingTeacher = await teacherRepository.findTeacherById(id);

    if (!existingTeacher) {
        throw new Error("Teacher not found.");
    }

    if (
        teacherData.email &&
        teacherData.email !== existingTeacher.email
    ) {
        const duplicate = await teacherRepository.findTeacherByEmail(
            teacherData.email
        );

        if (duplicate) {
            throw new Error("Email already exists.");
        }
    }

    return await teacherRepository.updateTeacher(id, teacherData);
};

exports.deleteTeacher = async(id) => {
    const existingTeacher = await teacherRepository.findTeacherById(id);

    if (!existingTeacher) {
        throw new Error("Teacher not found.");
    }

    return await teacherRepository.deleteTeacher(id);
};