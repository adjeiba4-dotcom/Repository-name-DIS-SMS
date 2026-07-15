const enrollmentRepository = require("../repositories/enrollment.create.repository");

exports.createEnrollment = async(enrollmentData) => {
    return await enrollmentRepository.createEnrollment(enrollmentData);
};