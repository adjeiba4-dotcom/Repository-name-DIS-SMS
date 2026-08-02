const studentRepository = require("../repositories/student.repository");

const {
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all active students
 */
exports.getStudents = async() => {
    return await studentRepository.findAllStudents();
};

/**
 * Get student by ID
 */
exports.getStudentById = async(id) => {
    const student = await studentRepository.findStudentById(id);

    if (!student) {
        throw new NotFoundError("Student not found.");
    }

    return student;
};

/**
 * Search students
 */
exports.searchStudents = async(keyword) => {
    return await studentRepository.searchStudents(keyword);
};

/**
 * Register a new student
 */
exports.createStudent = async(studentData) => {

    // Check duplicate admission number
    const existingStudent =
        await studentRepository.findStudentByAdmissionNo(
            studentData.admissionNo
        );

    if (existingStudent) {
        throw new ConflictError(
            "Admission number already exists."
        );
    }

    // Guardian validation
    const guardian =
        await studentRepository.guardianExists(
            studentData.guardianId
        );

    if (!guardian) {
        throw new NotFoundError(
            "Guardian not found."
        );
    }

    // Class validation
    const schoolClass =
        await studentRepository.classExists(
            studentData.classId
        );

    if (!schoolClass) {
        throw new NotFoundError(
            "Class not found."
        );
    }

    // Convert dates
    if (studentData.dateOfBirth) {
        studentData.dateOfBirth =
            new Date(studentData.dateOfBirth);
    }

    if (studentData.admissionDate) {
        studentData.admissionDate =
            new Date(studentData.admissionDate);
    }

    return await studentRepository.createStudent(studentData);
};

/**
 * Update student
 */
exports.updateStudent = async(id, studentData) => {

    // Check student exists
    const existingStudent =
        await studentRepository.findStudentById(id);

    if (!existingStudent) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    // Check duplicate admission number
    if (
        studentData.admissionNo &&
        studentData.admissionNo !== existingStudent.admissionNo
    ) {

        const duplicate =
            await studentRepository.findStudentByAdmissionNo(
                studentData.admissionNo
            );

        if (duplicate) {
            throw new ConflictError(
                "Admission number already exists."
            );
        }
    }

    // Validate guardian if supplied
    if (studentData.guardianId) {

        const guardian =
            await studentRepository.guardianExists(
                studentData.guardianId
            );

        if (!guardian) {
            throw new NotFoundError(
                "Guardian not found."
            );
        }
    }

    // Validate class if supplied
    if (studentData.classId) {

        const schoolClass =
            await studentRepository.classExists(
                studentData.classId
            );

        if (!schoolClass) {
            throw new NotFoundError(
                "Class not found."
            );
        }
    }

    // Convert dates
    if (studentData.dateOfBirth) {
        studentData.dateOfBirth =
            new Date(studentData.dateOfBirth);
    }

    if (studentData.admissionDate) {
        studentData.admissionDate =
            new Date(studentData.admissionDate);
    }

    return await studentRepository.updateStudent(
        id,
        studentData
    );
};

/**
 * Archive student
 */
exports.deleteStudent = async(id) => {

    const student =
        await studentRepository.findStudentById(id);

    if (!student) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    await studentRepository.softDeleteStudent(id);

    return {
        message: "Student archived successfully.",
    };
};

/**
 * Restore archived student
 */
exports.restoreStudent = async(id) => {

    const students =
        await studentRepository.findArchivedStudents();

    const exists = students.find(
        (item) => item.id === Number(id)
    );

    if (!exists) {
        throw new NotFoundError(
            "Archived student not found."
        );
    }

    return await studentRepository.restoreStudent(id);
};

/**
 * Get archived students
 */
exports.getArchivedStudents = async() => {
    return await studentRepository.findArchivedStudents();
};