const studentRepository = require("../repositories/student.repository");

const {
    NotFoundError,
    ConflictError,
    BadRequestError,
} = require("../errors");

const STUDENT_FIELDS = [
    "admissionNo",
    "firstName",
    "lastName",
    "otherName",
    "gender",
    "dateOfBirth",
    "admissionDate",
    "email",
    "phone",
    "address",
    "classId",
    "status",
];

const RELATIONSHIP_FROM_UI = {
    Father: "FATHER",
    Mother: "MOTHER",
    Guardian: "GUARDIAN",
    Uncle: "UNCLE",
    Aunt: "AUNT",
    Sibling: "OTHER",
    Other: "OTHER",
    FATHER: "FATHER",
    MOTHER: "MOTHER",
    GUARDIAN: "GUARDIAN",
    SPONSOR: "SPONSOR",
    UNCLE: "UNCLE",
    AUNT: "AUNT",
    BROTHER: "BROTHER",
    SISTER: "SISTER",
    GRANDPARENT: "GRANDPARENT",
    OTHER: "OTHER",
};

function sanitizeStudentData(data = {}) {
    const payload = {};

    for (const field of STUDENT_FIELDS) {
        if (data[field] === undefined) continue;
        payload[field] = data[field];
    }

    if (payload.classId != null) {
        payload.classId = Number(payload.classId);
    }

    if (payload.dateOfBirth) {
        payload.dateOfBirth = new Date(payload.dateOfBirth);
    }

    if (payload.admissionDate) {
        payload.admissionDate = new Date(payload.admissionDate);
    }

    return payload;
}

function extractGuardianLink(data = {}) {
    if (data.guardianId == null || data.guardianId === "") {
        return null;
    }

    const guardianId = Number(data.guardianId);
    if (Number.isNaN(guardianId) || guardianId < 1) {
        throw new BadRequestError("Guardian ID must be a valid integer.");
    }

    const rawRelationship = data.relationship;
    const relationship = rawRelationship
        ? RELATIONSHIP_FROM_UI[rawRelationship] || String(rawRelationship).toUpperCase()
        : "GUARDIAN";

    return { guardianId, relationship };
}

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
exports.createStudent = async(rawData) => {
    const guardianLink = extractGuardianLink(rawData);
    const studentData = sanitizeStudentData(rawData);

    if (!guardianLink) {
        throw new BadRequestError("Guardian is required.");
    }

    const existingStudent =
        await studentRepository.findStudentByAdmissionNo(
            studentData.admissionNo
        );

    if (existingStudent) {
        throw new ConflictError(
            "Admission number already exists."
        );
    }

    const guardian =
        await studentRepository.guardianExists(
            guardianLink.guardianId
        );

    if (!guardian) {
        throw new NotFoundError(
            "Guardian not found."
        );
    }

    const schoolClass =
        await studentRepository.classExists(
            studentData.classId
        );

    if (!schoolClass) {
        throw new NotFoundError(
            "Class not found."
        );
    }

    return await studentRepository.createStudent(
        studentData,
        guardianLink
    );
};

/**
 * Update student
 */
exports.updateStudent = async(id, rawData) => {
    const existingStudent =
        await studentRepository.findStudentById(id);

    if (!existingStudent) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    const guardianLink = extractGuardianLink(rawData);
    const studentData = sanitizeStudentData(rawData);

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

    if (guardianLink) {
        const guardian =
            await studentRepository.guardianExists(
                guardianLink.guardianId
            );

        if (!guardian) {
            throw new NotFoundError(
                "Guardian not found."
            );
        }
    }

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

    return await studentRepository.updateStudent(
        id,
        studentData,
        guardianLink
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
