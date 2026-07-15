const enrollmentRepository = require("../repositories/enrollment.repository");

exports.getEnrollments = async() => {
    return await enrollmentRepository.findAllEnrollments();
};