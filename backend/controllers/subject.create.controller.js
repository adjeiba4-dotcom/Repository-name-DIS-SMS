const subjectRepository = require("../repositories/subject.repository");

exports.createSubject = async(req, res) => {
    const subject = await subjectRepository.createSubject(req.body);

    res.status(201).json({
        success: true,
        message: "Subject created successfully.",
        data: subject,
    });
};