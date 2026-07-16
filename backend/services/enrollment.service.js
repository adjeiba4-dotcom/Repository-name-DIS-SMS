const enrollmentRepository = require("../repositories/enrollment.repository");

exports.getEnrollments = async() => {
    return await enrollmentRepository.findAllEnrollments();
};

exports.getEnrollmentById = async(id) => {
    const enrollment =
        await enrollmentRepository.findEnrollmentById(id);

    if (!enrollment) {
        throw new Error("Enrollment not found.");
    }

    return enrollment;
};

exports.createEnrollment = async(enrollmentData) => {
    return await enrollmentRepository.createEnrollment(
        enrollmentData
    );
};

exports.updateEnrollment = async(id, enrollmentData) => {
    const existingEnrollment =
        await enrollmentRepository.findEnrollmentById(id);

    if (!existingEnrollment) {
        throw new Error("Enrollment not found.");
    }

    return await enrollmentRepository.updateEnrollment(
        id,
        enrollmentData
    );
};

exports.deleteEnrollment = async(id) => {
    const existingEnrollment =
        await enrollmentRepository.findEnrollmentById(id);

    if (!existingEnrollment) {
        throw new Error("Enrollment not found.");
    }

    await enrollmentRepository.deleteEnrollment(id);

    return {
        id: Number(id),
    };
};