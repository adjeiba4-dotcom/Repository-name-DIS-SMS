const studentRepository = require("../repositories/student.repository");

exports.getStudents = async() => {
    return await studentRepository.findAllStudents();
};

exports.getStudentById = async(id) => {
    const student = await studentRepository.findStudentById(id);

    if (!student) {
        throw new Error("Student not found.");
    }

    return student;
};

exports.createStudent = async(studentData) => {
    const existingStudent =
        await studentRepository.findStudentByAdmissionNo(
            studentData.admissionNo
        );

    if (existingStudent) {
        throw new Error("Admission number already exists.");
    }

    return await studentRepository.createStudent(studentData);
};

exports.updateStudent = async(id, studentData) => {
    const existingStudent =
        await studentRepository.findStudentById(id);

    if (!existingStudent) {
        throw new Error("Student not found.");
    }

    if (
        studentData.admissionNo &&
        studentData.admissionNo !== existingStudent.admissionNo
    ) {
        const duplicate =
            await studentRepository.findStudentByAdmissionNo(
                studentData.admissionNo
            );

        if (duplicate) {
            throw new Error("Admission number already exists.");
        }
    }

    return await studentRepository.updateStudent(id, studentData);
};

exports.deleteStudent = async(id) => {
    const existingStudent =
        await studentRepository.findStudentById(id);

    if (!existingStudent) {
        throw new Error("Student not found.");
    }

    await studentRepository.softDeleteStudent(id);

    return {
        message: "Student archived successfully.",
    };
};